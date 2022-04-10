import React, { Suspense, useEffect, useState } from "react";
import { Column } from "./components/Flex";
import { Text } from "./components/Typography";
import moment from "moment";
import { TimerForm } from "./components/TimerForm";
import { DateString } from "./CustomTypes";
import { TimersScreen } from "./components/TimersScreen";
import { config } from "./config";
import { SettingsScreen } from "./components/SettingsScreen";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { LoadingScreen } from "./components/LoadingScreen";
import { emit } from "@tauri-apps/api/event";
import { TimersScreen_Timer$data } from "./components/__generated__/TimersScreen_Timer.graphql";
import { App_CurrentUserQuery } from "./__generated__/App_CurrentUserQuery.graphql";
import { Layout } from "./components/Layout";

type AppState = {
  viewingDate: DateString;
} & (
  | {
      tag: "viewingTimers" | "addingTimer" | "viewingSettings";
    }
  | {
      tag: "editingTimer";
      timer: TimersScreen_Timer$data;
    }
);

type AppProps = { clearCache: () => void };

export const App = (props: AppProps) => {
  const [state, setState] = useState<AppState>({
    viewingDate: moment().format(config.dateFormat),
    tag: "viewingTimers",
  });

  const { currentUser } = useLazyLoadQuery<App_CurrentUserQuery>(
    graphql`
      query App_CurrentUserQuery {
        currentUser {
          id
          name
          recordingTimer {
            id
            date
          }
        }
      }
    `,
    {}
  );

  useEffect(() => {
    emit("recording", Boolean(currentUser.recordingTimer));
  }, [currentUser.recordingTimer]);

  return (
    <Layout user={currentUser}>
      <Suspense fallback={<LoadingScreen message="Gotcha!" />}>
        {/* Viewing timers */}
        {state.tag === "viewingTimers" ? (
          <TimersScreen
            date={state.viewingDate}
            recordingTimer={currentUser.recordingTimer}
            setDate={(viewingDate: DateString) => {
              setState((prevState) => ({ ...prevState, viewingDate }));
            }}
            onViewSettings={() => {
              setState((prevState) => ({ ...prevState, tag: "viewingSettings" }));
            }}
            onAdd={() => {
              setState((prevState) => ({ ...prevState, tag: "addingTimer" }));
            }}
            onEdit={(timer) => {
              setState((prevState) => ({
                ...prevState,
                tag: "addingTimer",
                timer,
              }));
            }}
          />

        // Creating or editing timer
        ) : state.tag === "addingTimer" || state.tag === "editingTimer" ? (
          <TimerForm
            timer={
              state.tag === "editingTimer"
                ? {
                    id: state.timer.id,
                    projectId: state.timer.project.id,
                    date: state.timer.date,
                    seconds: state.timer.seconds,
                    notes: state.timer.notes,
                  }
                : {
                    id: undefined,
                    projectId: "",
                    date: state.viewingDate,
                    seconds: 0,
                    notes: "",
                  }
            }
            afterSave={(timer) => {
              setState((prevState) => ({
                ...prevState,
                viewingDate: timer.date,
                tag: "viewingTimers",
              }));
            }}
            onCancel={() => {
              setState((prevState) => ({
                ...prevState,
                tag: "viewingTimers",
              }));
            }}
          />

        // Viewing settings
        ) : state.tag === "viewingSettings" ? (
          <SettingsScreen
            clearCache={props.clearCache}
            onClose={() => {
              setState((prevState) => ({ ...prevState, tag: "viewingTimers" }));
            }}
          />

        // Unexpected state
        // TODO: error reporting
        ) : (
          <Column
            fullHeight
            backgroundColor="white"
            alignItems="center"
            justifyContent="center"
          >
            <Text>Error: Unexpected app state</Text>
          </Column>
        )}
      </Suspense>
    </Layout>
  );
};
