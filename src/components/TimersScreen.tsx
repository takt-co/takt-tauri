import React, { Suspense, useEffect, useState } from "react";
import moment from "moment";
import { useFragment, useMutation } from "react-relay";
import { colors, darken } from "../TaktTheme";
import { DateString, ID, NonNullTimer } from "../CustomTypes";
import { Button } from "./Button";
import { ButtonBar } from "./ButtonBar";
import { Column, Row } from "./Flex";
import { AddIcon, SettingsIcon, TimerOffIcon, TodayIcon } from "./Icons";
import { EmptyWarmdown, LoadingScreen } from "./LoadingScreen";
import { Text } from "./Typography";
import { graphql } from "babel-plugin-relay/macro";
import { clockToSeconds, secondsToClock } from "../Clock";
import {
  TimersScreen_Timer$data,
  TimersScreen_Timer$key,
} from "./__generated__/TimersScreen_Timer.graphql";
import { TimersScreen_StartRecordingMutation } from "./__generated__/TimersScreen_StartRecordingMutation.graphql";
import { TimersScreen_StopRecordingMutation } from "./__generated__/TimersScreen_StopRecordingMutation.graphql";
import { useDialog } from "../providers/Dialog";
import { TimersScreen_ArchiveMutation } from "./__generated__/TimersScreen_ArchiveMutation.graphql";
import { Authenticated, useAuthentication } from "../providers/Authentication";
import { App_TimersQuery$data } from "../__generated__/App_TimersQuery.graphql";
import { Layout } from "./Layout";
import { IconButton } from "@mui/material";
import { config } from "../config";
import { Tooltip } from "./Tooltip";
import { DateBar } from "./DateBar";

export const TimersScreen = (props: {
  query: App_TimersQuery$data;
  date: DateString;
  setDate: (date: DateString) => void;
  onEdit: (timer: TimersScreen_Timer$data) => void;
  onAdd: () => void;
  recordingTimerId: ID | null;
  onViewSettings: () => void;
}) => {
  return (
    <Column fullWidth fullHeight>
      <Layout.TopBarRight>
        <Row paddingHorizontal="tiny">
          <IconButton
            onClick={() => {
              const today = moment();
              today.startOf("day");
              props.setDate(today.format(config.dateFormat));
            }}
          >
            <Tooltip placement="left" key="Today" title="Jump to today">
              <Row>
                <TodayIcon height={24} fill={colors.white} />
              </Row>
            </Tooltip>
          </IconButton>
          <IconButton
            onClick={props.onViewSettings}
          >
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
            prevDate.startOf("day");
            prevDate.subtract(12, "hours");
            props.setDate(prevDate.format(config.dateFormat));
          }}
          onNext={() => {
            const nextDate = moment(props.date, config.dateFormat);
            nextDate.endOf("day");
            nextDate.add(12, "hours");
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
              Warmdown={
                props.query.currentUser.timers.edges.length === 0
                  ? TimersEmptyState
                  : EmptyWarmdown
              }
            />
          }
        >
          <Timers
            query={props.query}
            date={props.date}
            onEdit={props.onEdit}
            onAdd={props.onAdd}
            recordingTimerId={props.recordingTimerId}
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
  query: App_TimersQuery$data;
  date: DateString;
  onEdit: (timer: TimersScreen_Timer$data) => void;
  onAdd: () => void;
  recordingTimerId: ID | null;
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

  const timers = props.query.currentUser.timers.edges
    .filter((e) => ["recording", "paused"].includes(e.node?.status ?? ""))
    .map((e) => e.node) as ReadonlyArray<NonNullTimer>;

  if (timers.length === 0) {
    return <TimersEmptyState />;
  }

  return (
    <Column fullHeight>
      {timers.map((timer) => (
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
                            props.recordingTimerId === timer.id
                              ? null
                              : props.recordingTimerId,
                        },
                      },
                    },
                  },
                });
              },
            });
          }}
        />
      ))}
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

const TimerCard = (props: {
  timer: TimersScreen_Timer$key;
  onEdit: (timer: TimersScreen_Timer$data) => void;
  onDelete: (timer: TimersScreen_Timer$data) => void;
  currentRecordingId?: ID;
}) => {
  const auth = useAuthentication() as Authenticated;
  const timer = useFragment<TimersScreen_Timer$key>(
    graphql`
      fragment TimersScreen_Timer on Timer {
        id
        date
        seconds
        status
        notes
        updatedAt
        project {
          id
          name
        }
      }
    `,
    props.timer
  );

  let diff =
    timer.status === "recording"
      ? moment().diff(moment(timer.updatedAt), "seconds")
      : 0;
  if (diff < 0) diff = 0;
  const clock = secondsToClock(timer.seconds + diff);

  const [startRecording, startRecordingInFlight] =
    useMutation<TimersScreen_StartRecordingMutation>(graphql`
      mutation TimersScreen_StartRecordingMutation($timerId: ID!) {
        startRecording(input: { timerId: $timerId }) {
          timer {
            id
            status
            seconds
            updatedAt
            user {
              id
              recordingTimer {
                id
              }
            }
          }
          pausedTimer {
            id
            status
            seconds
            updatedAt
          }
        }
      }
    `);

  const [stopRecording, stopRecordingInFlight] =
    useMutation<TimersScreen_StopRecordingMutation>(graphql`
      mutation TimersScreen_StopRecordingMutation($timerId: ID!) {
        stopRecording(input: { timerId: $timerId }) {
          timer {
            id
            status
            seconds
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

  return (
    <Row
      key={timer.id}
      style={{ borderBottom: `1px solid ${colors.offWhite}` }}
      justifyContent="space-between"
      alignItems="flex-start"
      padding="small"
    >
      <Column alignItems="flex-start" gap="small" fullWidth>
        <Row fullWidth alignItems="center">
          <Column fullWidth gap="tiny">
            <Text strong>{timer.project.name}</Text>
            <Text fontSize="detail">No tags</Text>
          </Column>
          <Row alignItems="center" gap="smaller">
            <Row alignItems="flex-end">
              <Text fontSize="large">
                {clock.hours}:{clock.minutes}
              </Text>
            </Row>
            <RecordButton
              recording={timer.status === "recording"}
              onClick={() => {
                if (startRecordingInFlight || stopRecordingInFlight) {
                  return;
                }

                if (timer.status === "recording") {
                  const optimisticResponse: TimersScreen_StopRecordingMutation["response"] =
                    {
                      stopRecording: {
                        timer: {
                          id: timer.id,
                          status: "paused",
                          seconds: clockToSeconds(clock),
                          updatedAt: moment().toISOString(),
                          user: {
                            id: auth.currentUserId,
                            recordingTimer: null,
                          },
                        },
                      },
                    };

                  stopRecording({
                    variables: { timerId: timer.id },
                    optimisticResponse,
                  });
                } else if (timer.status === "paused") {
                  const optimisticResponse: TimersScreen_StartRecordingMutation["response"] =
                    {
                      startRecording: {
                        timer: {
                          ...timer,
                          status: "recording",
                          seconds: timer.seconds,
                          updatedAt: moment().toISOString(),
                          user: {
                            id: auth.currentUserId,
                            recordingTimer: {
                              id: timer.id,
                            },
                          },
                        },
                        pausedTimer: props.currentRecordingId
                          ? {
                              id: props.currentRecordingId,
                              status: "paused",
                              seconds: 0, // TODO
                              updatedAt: moment().toISOString(),
                            }
                          : null,
                      },
                    };

                  startRecording({
                    variables: { timerId: timer.id },
                    optimisticResponse,
                  });
                } else {
                  // TODO: ERROR REPORTING
                }
              }}
            />
          </Row>
        </Row>

        {timer.notes.length > 0 && (
          <Column
            style={{ borderLeft: `1px solid ${colors.gray}` }}
            paddingHorizontal="tiny"
          >
            <Text
              fontSize="detail"
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                color: colors.darkGray,
              }}
            >
              {timer.notes}
            </Text>
          </Column>
        )}

        <Row gap="tiny">
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              props.onEdit({ ...timer, seconds: clockToSeconds(clock) });
            }}
          >
            Edit
          </Button>
          <Button
            variant="text"
            color="warning"
            size="small"
            onClick={() => {
              props.onDelete(timer);
            }}
          >
            Delete
          </Button>
        </Row>
      </Column>
    </Row>
  );
};

const RecordButton = (props: { recording: boolean; onClick: () => void }) => {
  return (
    <span
      onClick={props.onClick}
      style={{
        display: "block",
        width: 16,
        height: 16,
        backgroundColor: props.recording ? colors.warning : colors.gray,
        borderRadius: 100,
        cursor: "pointer",
      }}
    />
  );
};
