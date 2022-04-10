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
import { App_TimersQuery } from "./__generated__/App_TimersQuery.graphql";
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

// TODO: can clearly be refactored!
export const App = (props: AppProps) => {
  return (
    <Layout>
      <Suspense fallback={<LoadingScreen message="Gotcha!" />}>
        <AppWithoutUser {...props} />
      </Suspense>
    </Layout>
  );
};

const AppWithoutUser = (props: AppProps) => {
  const { currentUser } = useLazyLoadQuery<App_CurrentUserQuery>(
    graphql`
      query App_CurrentUserQuery {
        currentUser {
          id
          name
          recordingTimer {
            id
          }
        }
      }
    `,
    {}
  );

  const [state, setState] = useState<AppState>({
    viewingDate: moment().format(config.dateFormat),
    tag: "viewingTimers",
  });

  const timersQuery = useLazyLoadQuery<App_TimersQuery>(
    graphql`
      query App_TimersQuery($date: ISO8601Date!) {
        currentUser {
          timers(endDate: $date, startDate: $date, first: 100)
            @connection(key: "TimersScreen__timers") {
            __id
            edges {
              cursor
              node {
                id
                status
                ...TimersScreen_Timer
              }
            }
          }
        }
      }
    `,
    { date: state.viewingDate }
  );

  useEffect(() => {
    emit("recording", Boolean(currentUser.recordingTimer));
  }, [currentUser.recordingTimer]);


  if (state.tag === "viewingTimers") {
    return (
      <TimersScreen
        date={state.viewingDate}
        query={timersQuery}
        recordingTimerId={currentUser.recordingTimer?.id ?? null}
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
    );
  }

  if (state.tag === "addingTimer" || state.tag === "editingTimer") {
    return (
      <TimerForm
        date={state.viewingDate}
        setDate={(viewingDate: DateString) => {
          setState((prevState) => ({ ...prevState, viewingDate }));
        }}
        connectionId={timersQuery.currentUser.timers.__id}
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
                date: "2000-01-01",
                seconds: 0,
                notes: "",
              }
        }
        afterSave={(timer) => {
          setState((prevState) => ({
            ...prevState,
            viewingDate: timer.date,
            tag: "viewingSettings",
          }));
        }}
        onCancel={() => {
          setState((prevState) => ({
            ...prevState,
            tag: "viewingSettings",
          }));
        }}
      />
    );
  }

  if (state.tag === "viewingSettings") {
    return (
      <SettingsScreen
        clearCache={props.clearCache}
        onClose={() => {
          setState((prevState) => ({ ...prevState, tag: "viewingTimers" }));
        }}
      />
    );
  }

  // TODO: error reporting

  return (
    <Column
      fullHeight
      backgroundColor="white"
      alignItems="center"
      justifyContent="center"
    >
      <Text>Error: Unexpected app state</Text>
    </Column>
  );
};

export default App;
