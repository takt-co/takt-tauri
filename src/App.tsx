import React, { Suspense, useEffect, useState } from "react";
import { Column, Row } from "./components/Flex";
import { colors } from "./TaktTheme";
import { Text } from "./components/Typography";
import moment from "moment";
import { TimerForm } from "./components/TimerForm";
import { DateString, NonNullTimer } from "./CustomTypes";
import { TimersEmptyState, TimersScreen } from "./components/TimersScreen";
import { config } from "./config";
import { TopBar } from "./components/TopBar";
import {
  CrossIcon,
  ProjectsIcon,
  SettingsIcon,
  TodayIcon,
} from "./components/Icons";
import { Avatar, IconButton } from "@mui/material";
import { SettingsScreen } from "./components/SettingsScreen";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { AppQuery } from "./__generated__/AppQuery.graphql";
import { EmptyWarmdown, LoadingScreen } from "./components/LoadingScreen";
import { Tooltip } from "./components/Tooltip";
import { emit } from "@tauri-apps/api/event";
import { TimersScreen_Timer$data } from "./components/__generated__/TimersScreen_Timer.graphql";
import { App_CurrentUserQuery } from "./__generated__/App_CurrentUserQuery.graphql";
import { App_TimersQuery } from "./__generated__/App_TimersQuery.graphql";

type AppState = {
  viewingDate: DateString
} & (
  | {
      tag: "viewingTimers" | "addingTimer" | "viewingSettings";
    }
  | {
      tag: "editingTimer";
      timer: TimersScreen_Timer$data;
    }
    );

export const App = (props: { clearCache: () => void }) => {
  const [state, setState] = useState<AppState>({
    viewingDate: moment().format(config.dateFormat),
    tag: "viewingTimers",
  });

  const { currentUser } = useLazyLoadQuery<App_CurrentUserQuery>(graphql`
    query App_CurrentUserQuery {
      currentUser {
        id
        name
        recordingTimer {
          id
        }
      }
    }
  `, {});

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

  const timers = timersQuery.currentUser.timers.edges
    .filter(Boolean)
    .map((e) => e.node) as ReadonlyArray<NonNullTimer>;

  useEffect(() => {
    emit("recording", Boolean(currentUser.recordingTimer));
  }, [currentUser.recordingTimer]);

  const setViewingDate = (viewingDate: DateString) => {
    setState((prevState) => ({ ...prevState, viewingDate }));
  };

  return (
    <Column
      style={{
        height: "calc(100vh - 10px)",
        overflow: "hidden",
        borderRadius: 5,
      }}
    >
      {/* TODO: layout transport thing so screens can update this area */}
      <TopBar
        left={
          <Row paddingHorizontal="tiny" alignItems="center">
            <IconButton>
              <Tooltip title={currentUser.name} key="User" placement="right">
                <Suspense fallback={() => null}>
                  <Avatar
                    alt={currentUser.name}
                    sx={{ width: 26, height: 26, bgcolor: colors.darkPrimary }}
                  />
                </Suspense>
              </Tooltip>
            </IconButton>
            <IconButton>
              <Tooltip title="Manage projects" key="Projects" placement="right">
                <Row>
                  <ProjectsIcon height={20} fill={colors.white} />
                </Row>
              </Tooltip>
            </IconButton>
          </Row>
        }
        right={
          state.tag === "viewingTimers" ? (
            <Row paddingHorizontal="tiny">
              <IconButton
                onClick={() => {
                  const today = moment();
                  today.startOf("day");
                  setState((prevState) => ({ ...prevState, date: today.format(config.dateFormat) }));
                }}
              >
                <Tooltip placement="left" key="Today" title="Jump to today">
                  <Row>
                    <TodayIcon height={24} fill={colors.white} />
                  </Row>
                </Tooltip>
              </IconButton>
              <IconButton
                onClick={() => {
                  setState((prevState) => ({ ...prevState, tag: "viewingSettings" }));
                }}
              >
                <Tooltip placement="left" key="Settings" title="Settings">
                  <Row>
                    <SettingsIcon height={20} fill={colors.white} />
                  </Row>
                </Tooltip>
              </IconButton>
            </Row>
          ) : state.tag === "viewingSettings" ? (
            <Row paddingHorizontal="tiny">
              <IconButton
                onClick={() => {
                  setState((prevState) => ({ ...prevState, tag: "viewingSettings" }));
                }}
              >
                <Tooltip placement="right" key="Close" title="Close settings">
                  <Row>
                    <CrossIcon height={20} fill={colors.white} />
                  </Row>
                </Tooltip>
              </IconButton>
            </Row>
          ) : undefined
        }
      />

      {state.tag === "viewingTimers" ? (
        <Suspense
          fallback={
            <LoadingScreen
              message="Fetching timers"
              Warmdown={timers.length === 0 ? TimersEmptyState : EmptyWarmdown}
            />
          }
        >
          <TimersScreen
            date={state.viewingDate}
            query={timersQuery}
            recordingTimerId={currentUser.recordingTimer?.id ?? null}
            setDate={setViewingDate}
            onAdd={() => {
              setState((prevState) => ({ ...prevState, tag: "addingTimer" }));
            }}
            onEdit={(timer) => {
              setState((prevState) => ({ ...prevState, tag: "addingTimer", timer }));
            }}
          />
        </Suspense>
      ) : state.tag === "addingTimer" || state.tag === "editingTimer" ? (
        <Suspense fallback={<LoadingScreen message="Fetching projects" />}>
          <TimerForm
            date={state.viewingDate}
            setDate={setViewingDate}
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
                tag: "viewingSettings"
              }));
            }}
            onCancel={() => {
              setState((prevState) => ({ ...prevState, tag: "viewingSettings" }));
            }}
          />
        </Suspense>
      ) : state.tag === "viewingSettings" ? (
        <SettingsScreen clearCache={props.clearCache} />
      ) : (
        <Column
          fullHeight
          backgroundColor="white"
          alignItems="center"
          justifyContent="center"
        >
           {/* TODO: error reporting! */}
          <Text>Error: Unexpected app state</Text>
        </Column>
      )}
    </Column>
  );
};

export default App;
