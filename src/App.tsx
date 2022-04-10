import React, { Suspense, useState } from "react";
import { Column, Row } from "./components/Flex";
import { colors } from "./TaktTheme";
import { Text } from "./components/Typography";
import moment from "moment";
import { TimerForm } from "./components/TimerForm";
import { DateString, ID } from "./CustomTypes";
import { TimersEmptyState, TimersScreen } from "./components/TimersScreen";
import { TimersScreen_Timer$data } from "./components/__generated__/TimersScreen_Timer.graphql";
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

type AppState =
  | {
      tag: "viewingTimers" | "addingTimer" | "viewingSettings";
    }
  | {
      tag: "editingTimer";
      timer: TimersScreen_Timer$data;
    };

export const App = (props: { clearCache: () => void }) => {
  const [timersConnectionId, setTimersConnectionId] = useState<ID>("");
  const [timersCount, setTimersCount] = useState(0);
  const [date, setDate] = useState<DateString>(
    moment().format(config.dateFormat)
  );
  const [state, setState] = useState<AppState>({
    tag: "viewingTimers",
  });

  const { currentUser } = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery {
        currentUser {
          id
          name
        }
      }
    `,
    {}
  );

  return (
    <Column
      style={{
        height: "calc(100vh - 10px)",
        overflow: "hidden",
        borderRadius: 5,
      }}
    >
      <TopBar
        left={
          <Row paddingHorizontal="tiny" alignItems="center">
            <IconButton>
              <Tooltip title={currentUser.name} key="User" placement="right">
                <Avatar
                  alt={currentUser.name}
                  sx={{ width: 26, height: 26, bgcolor: colors.darkPrimary }}
                />
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
                  setDate(today.format(config.dateFormat));
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
                  setState({ tag: "viewingSettings" });
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
                  setState({ tag: "viewingTimers" });
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

      <Column
        fullHeight
        backgroundColor="white"
        hidden={state.tag !== "viewingTimers"}
      >
        <Suspense
          fallback={
            <LoadingScreen
              message="Fetching timers"
              Warmdown={timersCount === 0 ? TimersEmptyState : EmptyWarmdown}
            />
          }
        >
          <TimersScreen
            date={date}
            onConnectionIdUpdate={setTimersConnectionId}
            onTimersCountChange={setTimersCount}
            setDate={setDate}
            onAdd={() => {
              setState({ tag: "addingTimer" });
            }}
            onEdit={(timer) => {
              setState({ tag: "editingTimer", timer });
            }}
          />
        </Suspense>
      </Column>

      {state.tag === "addingTimer" || state.tag === "editingTimer" ? (
        <Suspense fallback={<LoadingScreen message="Fetching projects" />}>
          <TimerForm
            date={date}
            setDate={setDate}
            connectionId={timersConnectionId}
            timer={state.tag === "editingTimer" ? state.timer : null}
            afterSave={(timer) => {
              setDate(timer.date);
              setState({ tag: "viewingTimers" });
            }}
            onCancel={() => {
              setState({ tag: "viewingTimers" });
            }}
          />
        </Suspense>
      ) : state.tag === "viewingSettings" ? (
        <SettingsScreen clearCache={props.clearCache} />
      ) : state.tag === "viewingTimers" ? null : ( // handled by setting the visible prop on TimersScreen
        // TODO: error reporting!
        <Column
          fullHeight
          backgroundColor="white"
          alignItems="center"
          justifyContent="center"
        >
          <Text>Error: Unexpected app state</Text>
        </Column>
      )}
    </Column>
  );
};

export default App;
