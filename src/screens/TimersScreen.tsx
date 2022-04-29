import React, { Suspense, useEffect, useState } from "react";
import moment from "moment";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { DateString, ID } from "../CustomTypes";
import { Button } from "../components/Button";
import { ButtonBar } from "../components/ButtonBar";
import { Column, Row } from "../components/Flex";
import {
  AddIcon,
  ClockIcon,
  TimerOffIcon,
  TodayIcon,
} from "../components/Icons";
import { LoadingScreen } from "../components/LoadingScreen";
import { Text } from "../components/Typography";
import { graphql } from "babel-plugin-relay/macro";
import { TimersScreen_ArchiveMutation } from "./__generated__/TimersScreen_ArchiveMutation.graphql";
import { Authenticated, useAuthentication } from "../providers/Authentication";
import { IconButton, useTheme } from "@mui/material";
import { config } from "../config";
import { Tooltip } from "../components/Tooltip";
import { DateBar } from "../components/DateBar";
import { TimersScreen_Query } from "./__generated__/TimersScreen_Query.graphql";
import { TimerCard } from "../components/TimerCard";
import { useAppState } from "../providers/AppState";
import { useSnacks } from "../providers/Snacks";

export const TimersScreen = (props: {
  date: DateString;
  recordingTimer: { id: ID; date: DateString } | null;
}) => {
  const { setAppState } = useAppState();
  const theme = useTheme();
  const todayStr = moment().format(config.dateFormat);

  return (
    <Column fullWidth fullHeight style={{ background: "white" }}>
      <DateBar
        date={props.date}
        onPrev={() => {
          const prevDate = moment(props.date, config.dateFormat);
          prevDate.subtract(1, "day");
          setAppState((s) => ({
            ...s,
            viewingDate: prevDate.format(config.dateFormat),
          }));
        }}
        onNext={() => {
          const nextDate = moment(props.date, config.dateFormat);
          nextDate.add(1, "day");
          setAppState((s) => ({
            ...s,
            viewingDate: nextDate.format(config.dateFormat),
          }));
        }}
      />

      <Column
        fullHeight
        style={{ height: "calc(100vh - 165px)", overflow: "auto" }}
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
            onEdit={(timer) => {
              setAppState((s) => ({
                ...s,
                tag: "editingTimer",
                timer,
              }));
            }}
            onAdd={() => {
              setAppState((s) => ({ ...s, tag: "addingTimer" }));
            }}
            recordingTimer={props.recordingTimer}
          />
        </Suspense>
      </Column>

      <ButtonBar justifyContent="space-between">
        <Row gap="tiny">
          {props.date !== todayStr && (
            <IconButton
              size="small"
              onClick={() => {
                setAppState((s) => ({ ...s, viewingDate: todayStr }));
              }}
            >
              <Tooltip placement="left" key="Today" title="Jump to today">
                <TodayIcon height={24} fill={theme.palette.text.secondary} />
              </Tooltip>
            </IconButton>
          )}

          {props.recordingTimer && props.recordingTimer.date !== props.date && (
            <IconButton
              onClick={() => {
                if (props.recordingTimer) {
                  const viewingDate = moment(props.recordingTimer.date).format(
                    config.dateFormat
                  );
                  setAppState((s) => ({ ...s, viewingDate }));
                }
              }}
            >
              <Tooltip
                placement="left"
                key="Today"
                title="Jump to recording timer"
              >
                <ClockIcon height={20} fill={theme.palette.text.secondary} />
              </Tooltip>
            </IconButton>
          )}
        </Row>
        <Button
          variant="outlined"
          size="small"
          startIcon={
            <AddIcon
              width={12}
              height={12}
              fill={theme.palette.primary.main}
              style={{ marginLeft: 2 }}
            />
          }
          onClick={() => {
            setAppState((s) => ({ ...s, tag: "addingTimer" }));
          }}
        >
          Add timer
        </Button>
      </ButtonBar>
    </Column>
  );
};

const Timers = (props: {
  date: DateString;
  onEdit: (timer: { id: ID; seconds: number }) => void;
  onAdd: () => void;
  recordingTimer: { id: ID; date: DateString } | null;
}) => {
  const snacks = useSnacks();
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
              }
            }
          }
        }
      }
    `,
    { date: props.date }
  );

  const { setAppState } = useAppState();

  useEffect(() => {
    setAppState((appContext) => {
      const newConnection = {
        id: timersQuery.currentUser.timers.__id,
        date: props.date,
      };

      const existingConnections = appContext.timerConnections.filter(
        (c) => c.date !== props.date
      );

      return {
        ...appContext,
        timerConnections: [newConnection, ...existingConnections],
      };
    });
  }, [timersQuery]);

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
                snacks.alert({
                  title: "Delete timer",
                  body: "Are you sure you want to delete this?",
                  severity: "warning",
                  actions: [
                    {
                      label: "Delete now",
                      onClick: () => {
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
                                  id: auth.currentUser.id,
                                  recordingTimer:
                                    props.recordingTimer?.id === timer.id
                                      ? null
                                      : props.recordingTimer?.id,
                                },
                              },
                            },
                          },
                        });
                        snacks.close();
                      },
                    },
                  ],
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
  const theme = useTheme();
  return (
    <Column fullHeight justifyContent="center" alignItems="center" gap="small">
      <TimerOffIcon width={30} fill={`${theme.palette.text.primary}`} />
      <Text color={theme.palette.text.primary}>No timers on this date</Text>
    </Column>
  );
};
