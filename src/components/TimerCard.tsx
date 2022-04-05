import React from "react";
import { useFragment, useMutation } from "react-relay";
import { Clock, clockToSeconds } from "../Clock";
import { ID } from "../Types";
import { graphql } from "babel-plugin-relay/macro";
import { Column, Row } from "./Flex";
import { colors } from "../Theme";
import { Text } from "./Typography";
import moment from "moment";
import { Button } from "./Button";
import { TimerCard_Timer$data, TimerCard_Timer$key } from "./__generated__/TimerCard_Timer.graphql";
import { TimerCard_StartRecordingMutation } from "./__generated__/TimerCard_StartRecordingMutation.graphql";
import { TimerCard_StopRecordingMutation } from "./__generated__/TimerCard_StopRecordingMutation.graphql";

export const TimerCard = (props: {
  timer: TimerCard_Timer$key;
  clock: Clock;
  recording: boolean;
  currentUserId: ID;
  onEdit: (timer: TimerCard_Timer$data) => void;
  onDelete: () => void;
}) => {
  const { clock, recording, currentUserId } = props;

  const timer = useFragment(graphql`
    fragment TimerCard_Timer on Timer {
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

  const [startRecording, startRecordingInFlight] = useMutation<TimerCard_StartRecordingMutation>(graphql`
    mutation TimerCard_StartRecordingMutation (
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
          ...TimerCard_Timer
        }
      }
    }
  `);

  const [stopRecording, stopRecordingInFlight] = useMutation<TimerCard_StopRecordingMutation>(graphql`
    mutation TimerCard_StopRecordingMutation (
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
          ...TimerCard_Timer
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
