import React, { Suspense, useEffect, useState } from "react";
import { Column } from "./components/Flex";
import { Text } from "./components/Typography";
import moment from "moment";
import { EditTimerForm, TimerForm } from "./components/TimerForm";
import { DateString } from "./CustomTypes";
import { TimersScreen } from "./components/TimersScreen";
import { config } from "./config";
import { SettingsScreen } from "./components/SettingsScreen";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { LoadingScreen } from "./components/LoadingScreen";
import { emit } from "@tauri-apps/api/event";
import { App_CurrentUserQuery } from "./__generated__/App_CurrentUserQuery.graphql";
import { Layout } from "./components/Layout";
import { TimerForm_Timer$key } from "./components/__generated__/TimerForm_Timer.graphql";

type AppState = {
  viewingDate: DateString;
} & (
  | {
      tag: "viewingTimers" | "addingTimer" | "viewingSettings";
    }
  | {
      tag: "editingTimer";
      timer: TimerForm_Timer$key;
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
    <Layout>
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
              setState((prevState) => ({
                ...prevState,
                tag: "viewingSettings",
              }));
            }}
            onAdd={() => {
              setState((prevState) => ({ ...prevState, tag: "addingTimer" }));
            }}
            onEdit={(timer) => {
              console.log("TimersScreen:onEdit", { timer });
              setState((prevState) => ({
                ...prevState,
                tag: "addingTimer",
                timer,
              }));
            }}
          />
        ) : // Creating a new timer
        state.tag === "addingTimer" ? (
          <TimerForm
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
        ) : // Editing a timer
        state.tag === "editingTimer" ? (
          <Suspense fallback={<LoadingScreen />}>
            <EditTimerForm
              timerKey={state.timer}
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
          </Suspense>
        ) : // Viewing settings
        state.tag === "viewingSettings" ? (
          <SettingsScreen
            clearCache={props.clearCache}
            onClose={() => {
              setState((prevState) => ({ ...prevState, tag: "viewingTimers" }));
            }}
          />
        ) : (
          // Unexpected state
          // TODO: error reporting
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
