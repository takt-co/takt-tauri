import React, { Suspense, useEffect, useState } from "react";
import moment from "moment";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { colors, darken } from "../TaktTheme";
import { DateString, ID } from "../CustomTypes";
import { Button } from "./Button";
import { ButtonBar } from "./ButtonBar";
import { Column, Row } from "./Flex";
import {
  AddIcon,
  ClockIcon,
  SettingsIcon,
  TimerOffIcon,
  TodayIcon,
} from "./Icons";
import { LoadingScreen } from "./LoadingScreen";
import { Text } from "./Typography";
import { graphql } from "babel-plugin-relay/macro";
import { useDialog } from "../providers/Dialog";
import { TimersScreen_ArchiveMutation } from "./__generated__/TimersScreen_ArchiveMutation.graphql";
import { Authenticated, useAuthentication } from "../providers/Authentication";
import { Layout } from "./Layout";
import { IconButton } from "@mui/material";
import { config } from "../config";
import { Tooltip } from "./Tooltip";
import { DateBar } from "./DateBar";
import { TimersScreen_Query } from "./__generated__/TimersScreen_Query.graphql";
import { TimerCard } from "./TimerCard";
import { TimerCard_Timer$data } from "./__generated__/TimerCard_Timer.graphql";

export const TimersScreen = (props: {
  date: DateString;
  setDate: (date: DateString) => void;
  onEdit: (timer: TimerCard_Timer$data) => void;
  onAdd: () => void;
  recordingTimer: { id: ID; date: DateString } | null;
  onViewSettings: () => void;
}) => {
  const todayStr = moment().format(config.dateFormat);
  return (
    <Column fullWidth fullHeight>
      <Layout.TopBarRight>
        <Row paddingHorizontal="tiny">
          {props.recordingTimer && props.recordingTimer.date !== props.date && (
            <IconButton
              onClick={() => {
                if (props.recordingTimer) {
                  props.setDate(
                    moment(props.recordingTimer.date).format(config.dateFormat)
                  );
                }
              }}
            >
              <Tooltip
                placement="left"
                key="Today"
                title="Jump to recording timer"
              >
                <Row>
                  <ClockIcon height={24} fill={colors.white} />
                </Row>
              </Tooltip>
            </IconButton>
          )}
          {props.date !== todayStr && (
            <IconButton
              onClick={() => {
                props.setDate(todayStr);
              }}
            >
              <Tooltip placement="left" key="Today" title="Jump to today">
                <Row>
                  <TodayIcon height={24} fill={colors.white} />
                </Row>
              </Tooltip>
            </IconButton>
          )}
          <IconButton onClick={props.onViewSettings}>
            <Tooltip placement="left" key="Settings" title="Settings">
              <Row>
                <SettingsIcon height={20} fill={colors.white} />
              </Row>
            </Tooltip>
          </IconButton>
        </Row>
      </Layout.TopBarRight>

      <Layout.TopBarBelow>
        <DateBar
          date={props.date}
          onPrev={() => {
            const prevDate = moment(props.date, config.dateFormat);
            prevDate.subtract(1, "day");
            props.setDate(prevDate.format(config.dateFormat));
          }}
          onNext={() => {
            const nextDate = moment(props.date, config.dateFormat);
            nextDate.add(1, "day");
            props.setDate(nextDate.format(config.dateFormat));
          }}
        />
      </Layout.TopBarBelow>

      <Column
        fullHeight
        style={{ height: "calc(100vh - 170px)", overflow: "auto" }}
        backgroundColor="white"
      >
        <Suspense
          fallback={
            <LoadingScreen
              message="Fetching timers"
              Warmdown={TimersEmptyState}
            />
          }
        >
          <Timers
            date={props.date}
            onEdit={props.onEdit}
            onAdd={props.onAdd}
            recordingTimer={props.recordingTimer}
          />
        </Suspense>
      </Column>

      <ButtonBar justifyContent="flex-end">
        <Button
          variant="outlined"
          size="small"
          startIcon={
            <AddIcon
              width={12}
              height={12}
              fill={colors.primary}
              style={{ marginLeft: 2 }}
            />
          }
          onClick={props.onAdd}
        >
          Add timer
        </Button>
      </ButtonBar>
    </Column>
  );
};

const Timers = (props: {
  date: DateString;
  onEdit: (timer: TimerCard_Timer$data) => void;
  onAdd: () => void;
  recordingTimer: { id: ID; date: DateString } | null;
}) => {
  const dialog = useDialog();
  const auth = useAuthentication() as Authenticated;
  const [timeNow, setTimeNow] = useState(moment());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeNow(moment());
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [timeNow, setTimeNow]);

  const timersQuery = useLazyLoadQuery<TimersScreen_Query>(
    graphql`
      query TimersScreen_Query($date: ISO8601Date!) {
        currentUser {
          timers(endDate: $date, startDate: $date, first: 100)
            @connection(key: "Timers__timers") {
            __id
            edges {
              cursor
              node {
                id
                status
                ...TimerCard_Timer
                ...App_TimerForm_Timer
              }
            }
          }
        }
      }
    `,
    { date: props.date }
  );

  const [archiveTimer] = useMutation<TimersScreen_ArchiveMutation>(graphql`
    mutation TimersScreen_ArchiveMutation($timerId: ID!) {
      archiveTimer(input: { timerId: $timerId }) {
        timer {
          id
          status
          updatedAt
          user {
            id
            recordingTimer {
              id
            }
          }
        }
      }
    }
  `);

  const timers = timersQuery.currentUser.timers.edges
    .filter((e) => ["recording", "paused"].includes(e.node?.status ?? ""))
    .map((e) => e.node);

  if (timers.length === 0) {
    return <TimersEmptyState />;
  }

  return (
    <Column fullHeight>
      {timersQuery.currentUser.timers.edges.map((edge) => {
        if (edge.node && ["recording", "paused"].includes(edge.node.status)) {
          const timer = edge.node;
          return (
            <TimerCard
              key={timer.id}
              timer={timer}
              onEdit={props.onEdit}
              onDelete={(timer) => {
                dialog.confirm({
                  title: "Delete timer",
                  body: "Are you sure you want to delete this timer?",
                  confirmColor: "warning",
                  confirmLabel: "Delete",
                  onConfirm: () => {
                    archiveTimer({
                      variables: { timerId: timer.id },
                      optimisticResponse: {
                        archiveTimer: {
                          timer: {
                            id: timer.id,
                            seconds: timer.seconds,
                            status: "deleted",
                            lastActionAt: moment().toISOString(),
                            user: {
                              id: auth.currentUserId,
                              recordingTimer:
                                props.recordingTimer?.id === timer.id
                                  ? null
                                  : props.recordingTimer?.id,
                            },
                          },
                        },
                      },
                    });
                  },
                });
              }}
            />
          );
        }

        // TODO: ERROR RESPORTING
        return null;
      })}
    </Column>
  );
};

export const TimersEmptyState = () => {
  return (
    <Column
      fullHeight
      justifyContent="center"
      alignItems="center"
      gap="small"
      backgroundColor="white"
    >
      <TimerOffIcon width={30} fill={darken("gray", 0.2)} />
      <Text color={colors.gray}>No timers on this date</Text>
    </Column>
  );
};
