import moment from "moment";
import React, { Suspense, useEffect, useState } from "react";
import { useFragment, useLazyLoadQuery, useMutation } from "react-relay";
import { dateFormat } from "../config";
import { useDebounced } from "../hooks/useDebounced";
import { colors, darken } from "../Theme";
import { DateString, ID } from "../Types";
import { Button } from "./Button";
import { ButtonBar } from "./ButtonBar";
import { Column, Row } from "./Flex";
import { AddIcon, Arrow, TimerOffIcon } from "./Icons";
import { LoadingScreen } from "./LoadingScreen";
import { Spacer } from "./Spacer";
import { Text } from "./Typography";
import { graphql } from "babel-plugin-relay/macro";
import { emit } from "@tauri-apps/api/event";
import { Clock, clockToSeconds, secondsToClock } from "../Clock";
import { TimersScreen_Timer$data, TimersScreen_Timer$key } from "./__generated__/TimersScreen_Timer.graphql";
import { TimersScreenQuery } from "./__generated__/TimersScreenQuery.graphql";
import { TimersScreen_StartRecordingMutation } from "./__generated__/TimersScreen_StartRecordingMutation.graphql";
import { TimersScreen_StopRecordingMutation } from "./__generated__/TimersScreen_StopRecordingMutation.graphql";

export const TimersScreen = (props: {
  date: DateString;
  setDate: (date: DateString) => void;
  onEdit: (timer: TimersScreen_Timer$data) => void;
  onAdd: () => void;
}) => {
  const { date, setDate } = props;

  return (
    <Column fullWidth fullHeight>
      <DateBar
        date={date}
        onChangeDate={setDate}
      />

      <Suspense fallback={<LoadingScreen />}>
        <Timers
          date={date}
          onEdit={props.onEdit}
          onAdd={props.onAdd}
        />
      </Suspense>

      <ButtonBar>
        <Spacer />
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
  )
}

const DateBar = (props: {
  date: DateString,
  onChangeDate: (date: DateString) => void;
}) => {
  // Preventing button spamming
  const [internalDate, setInternalDate] = useState(props.date);
  const debouncedDate = useDebounced(internalDate, 200);

  useEffect(() => {
    props.onChangeDate(debouncedDate);
  }, [debouncedDate]);

  return (
    <Row alignItems="center" justifyContent="space-between" padding="smaller" style={{ background: colors.offWhite, height: 46 }}>
      <Arrow
        width={20}
        style={{
          transform: "rotate(180deg)",
          cursor: "pointer",
        }}
        onClick={() => {
          const date = moment(props.date, dateFormat);
          date.startOf("day");
          date.subtract(12, "hours");
          setInternalDate(date.format(dateFormat));
        }}
      />

      <Text>{moment(props.date).format("dddd, D MMMM YYYY")}</Text>

      <Arrow
        width={20}
        style={{ cursor: "pointer" }}
        onClick={() => {
          const date = moment(props.date, dateFormat);
          date.endOf("day");
          date.add(12, "hours");
          setInternalDate(date.format(dateFormat));
        }}
      />
    </Row>
  )
};

const Timers = (props: {
  date: DateString;
  onEdit: (timer: TimersScreen_Timer$data) => void;
  onAdd: () => void;
}) => {
  const [timeNow, setTimeNow] = useState(moment());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeNow(moment());
    }, 5000);

    return () => { clearTimeout(timeout) }
  }, [timeNow, setTimeNow]);

  const data = useLazyLoadQuery<TimersScreenQuery>(graphql`
    query TimersScreenQuery (
      $date: ISO8601Date!
    ) {
      currentUser {
        id
        recordingTimer {
          id
        }
        timers(endDate: $date, startDate: $date) {
          nodes {
            id
            seconds
            lastActionAt
            ...TimersScreen_Timer
          }
        }
      }
    }
  `, {
    date: props.date
  }, {
    // TODO: only refetch after a create/update - fetchKey didn't work as anticipated
    fetchPolicy: "store-and-network",
  });

  useEffect(() => {
    emit("recording", !!data.currentUser.recordingTimer);
  }, [data.currentUser.recordingTimer]);

  const timers = data.currentUser.timers.nodes ?? [];

  if (timers.length === 0) {
    return (
      <Column fullHeight justifyContent="center" alignItems="center" gap="small">
        <TimerOffIcon width={30} fill={darken("gray", 0.2)} />
        <Text color="gray">No timers on this date</Text>
      </Column>
    )
  }

  return (
    <Column fullHeight fullWidth scrollable>
      {data.currentUser.timers.nodes?.map(timer => {
        if (!timer) return;

        const recording = timer.id === data.currentUser.recordingTimer?.id;
        const diff = recording ? timeNow.diff(moment(timer.lastActionAt), "seconds") : 0;
        const clock = secondsToClock(timer.seconds + diff);

        return (
          <TimerCard
            key={timer.id}
            timer={timer}
            clock={clock}
            currentUserId={data.currentUser.id}
            recording={recording}
            onEdit={props.onEdit}
            onDelete={() => {}}
          />
        )
      })}
    </Column>
  )
}

const TimerCard = (props: {
  timer: TimersScreen_Timer$key;
  clock: Clock;
  recording: boolean;
  currentUserId: ID;
  onEdit: (timer: TimersScreen_Timer$data) => void;
  onDelete: () => void;
}) => {
  const { clock, recording, currentUserId } = props;

  const timer = useFragment(graphql`
    fragment TimersScreen_Timer on Timer {
      id
      notes
      seconds
      lastActionAt
      date
      task {
        id
        name
        project {
          id
          name
        }
      }
    }
  `, props.timer);

  const [startRecording, startRecordingInFlight] = useMutation<TimersScreen_StartRecordingMutation>(graphql`
    mutation TimersScreen_StartRecordingMutation (
      $timerId: ID!
    ) {
      startRecording(input: {
        timerId: $timerId
      }) {
        user {
          id
          recordingTimer {
            id
          }
        }
        timer {
          ...TimersScreen_Timer
        }
      }
    }
  `);

  const [stopRecording, stopRecordingInFlight] = useMutation<TimersScreen_StopRecordingMutation>(graphql`
    mutation TimersScreen_StopRecordingMutation (
      $timerId: ID!
    ) {
      stopRecording(input: {
        timerId: $timerId
      }) {
        user {
          id
          recordingTimer {
            id
          }
        }
        timer {
          ...TimersScreen_Timer
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
            <Text strong>{timer.task.project.name}</Text>
            <Text fontSize="detail">{timer.task.name}</Text>
          </Column>
          <Row alignItems="center" gap="smaller">
            <Text fontSize="large">{clock.hours}:{clock.minutes}</Text>
            <RecordButton
              recording={recording}
              onClick={() => {
                if (startRecordingInFlight || stopRecordingInFlight) {
                  return;
                }

                if (recording) {
                  stopRecording({
                    variables: { timerId: timer.id },
                    optimisticResponse: {
                      stopRecording: {
                        timer: {
                          ...timer,
                          seconds: timer.seconds,
                          lastActionAt: moment().toISOString(),
                        },
                        user: {
                          id: currentUserId,
                          recordingTimer: null,
                        },
                      }
                    }
                  })
                } else {
                  startRecording({
                    variables: { timerId: timer.id },
                    optimisticResponse: {
                      startRecording: {
                        timer: {
                          ...timer,
                          seconds: timer.seconds,
                          lastActionAt: timer.lastActionAt,
                        },
                        user: {
                          id: currentUserId,
                          recordingTimer: {
                            id: timer.id,
                          },
                        },
                      }
                    },
                  })
                }
              }}
            />
          </Row>
        </Row>

        {timer.notes.length > 0 && (
          <Column style={{ borderLeft: `1px solid ${colors.gray}`}} paddingHorizontal="tiny">
            <Text
              fontSize="detail"
              style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, color: colors.darkGray }}
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
              props.onEdit({ ...timer, seconds: clockToSeconds(clock) })
            }}
          >
            Edit
          </Button>
          <Button
            variant="text"
            color="warning"
            size="small"
            onClick={props.onDelete}
          >
            Delete
          </Button>
        </Row>
      </Column>
    </Row>
  )
}

const RecordButton = (props: {
  recording: boolean;
  onClick: () => void;
}) => {
  return (
    <span
      onClick={props.onClick}
      style={{
        display: "block",
        width: 16,
        height: 16,
        backgroundColor: props.recording ? colors.recording : colors.gray,
        borderRadius: 100,
        cursor: "pointer",
      }}
    />
  )
}
