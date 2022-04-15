import React, { Suspense, useEffect, useState } from "react";
import { Column } from "./components/Flex";
import { Text } from "./components/Typography";
import moment from "moment";
import { EditTimerForm, TimerForm } from "./components/TimerForm";
import { TimersScreen } from "./components/TimersScreen";
import { config } from "./config";
import { SettingsScreen } from "./components/SettingsScreen";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { LoadingScreen } from "./components/LoadingScreen";
import { emit } from "@tauri-apps/api/event";
import { App_CurrentUserQuery } from "./__generated__/App_CurrentUserQuery.graphql";
import { Layout } from "./components/Layout";
import { AppState, AppStateProvider } from "./providers/AppState";

type AppProps = { clearCache: () => void };

export const App = (props: AppProps) => {
  const [appState, setAppState] = useState<AppState>({
    tag: "viewingTimers",
    viewingDate: moment().format(config.dateFormat),
    timerConnections: [],
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
    <AppStateProvider value={{ appState, setAppState }}>
      <Layout>
        {appState.tag === "viewingTimers" ? (
          <TimersScreen
            date={appState.viewingDate}
            recordingTimer={currentUser.recordingTimer}
          />
        ) : appState.tag === "addingTimer" ? (
          <TimerForm
            defaultValues={{
              timerId: undefined,
              projectId: undefined,
              status: "paused",
              date: appState.viewingDate,
              seconds: 0,
              notes: "",
            }}
          />
        ) : appState.tag === "editingTimer" ? (
          <Suspense fallback={<LoadingScreen />}>
            <EditTimerForm timerId={appState.timer.id} />
          </Suspense>
        ) : appState.tag === "viewingSettings" ? (
          <SettingsScreen clearCache={props.clearCache} />
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
      </Layout>
    </AppStateProvider>
  );
};
