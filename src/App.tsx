import React, { Suspense, useEffect, useState } from "react";
import { Column, Row } from "./components/Flex";
import { Text } from "./components/Typography";
import moment from "moment";
import {
  EditTimerFormScreen,
  TimerFormScreen,
} from "./screens/TimerFormScreen";
import { TimersScreen } from "./screens/TimersScreen";
import { config } from "./config";
import { SettingsScreen } from "./screens/SettingsScreen";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { LoadingScreen } from "./components/LoadingScreen";
import { emit } from "@tauri-apps/api/event";
import { App_CurrentUserQuery } from "./__generated__/App_CurrentUserQuery.graphql";
import { Layout } from "./components/Layout";
import { AppState, AppStateProvider } from "./providers/AppState";
import { ProjectsScreen } from "./screens/ProjectsScreen";
import { IconButton } from "@mui/material";
import {
  ProjectsIcon,
  SettingsIcon,
  TimelineIcon,
  TimerIcon,
} from "./components/Icons";
import { ReportingScreen } from "./screens/ReportingScreen";

type AppProps = { clearCache: () => void };

export const App = (props: AppProps) => {
  const [appState, setAppState] = useState<AppState>({
    tag: "timers",
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
        <Layout.TopBar>
          <Row justifyContent="space-around" alignItems="center">
            <IconButton
              size="small"
              title="Timers"
              onClick={() => {
                setAppState((state) => ({ ...state, tag: "timers" }));
              }}
            >
              <TimerIcon height={24} fill="white" />
            </IconButton>

            <IconButton
              size="small"
              title="Projects"
              onClick={() => {
                setAppState((state) => ({ ...state, tag: "projects" }));
              }}
            >
              <ProjectsIcon height={24} style={{ padding: 1 }} fill="white" />
            </IconButton>

            <IconButton
              size="small"
              title="Reporting"
              onClick={() => {
                setAppState((state) => ({ ...state, tag: "reporting" }));
              }}
            >
              <TimelineIcon height={24} fill="white" />
            </IconButton>

            <IconButton
              size="small"
              title="Settings"
              onClick={() => {
                setAppState((s) => ({ ...s, tag: "settings" }));
              }}
            >
              <SettingsIcon height={24} style={{ padding: 2 }} fill="white" />
            </IconButton>
          </Row>
        </Layout.TopBar>

        {appState.tag === "timers" ? (
          <TimersScreen
            date={appState.viewingDate}
            recordingTimer={currentUser.recordingTimer}
          />
        ) : appState.tag === "addingTimer" ? (
          <TimerFormScreen
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
            <EditTimerFormScreen timerId={appState.timer.id} />
          </Suspense>
        ) : appState.tag === "settings" ? (
          <SettingsScreen clearCache={props.clearCache} />
        ) : appState.tag === "projects" ? (
          <ProjectsScreen />
        ) : appState.tag === "reporting" ? (
          <ReportingScreen />
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
