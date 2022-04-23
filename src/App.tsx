import React, { Suspense, useEffect, useState } from "react";
import { Column, Row } from "./components/Flex";
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
import { IconButton } from "@mui/material";
import { ProjectsIcon } from "./components/Icons";
import { Tooltip } from "./components/Tooltip";

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
        <Layout.TopBarLeft>
          <Row paddingHorizontal="tiny" alignItems="center">
            <IconButton>
              <Tooltip title="Manage projects" key="Projects" placement="right">
                <ProjectsIcon height={20} fill="white" />
              </Tooltip>
            </IconButton>
          </Row>
        </Layout.TopBarLeft>

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
          <Column fullHeight alignItems="center" justifyContent="center">
            <Text>Error: Unexpected app state</Text>
          </Column>
        )}
      </Layout>
    </AppStateProvider>
  );
};
