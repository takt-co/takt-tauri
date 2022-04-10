import React from "react";
import { graphql } from "babel-plugin-relay/macro";
import moment from "moment";
import { useFragment, useMutation } from "react-relay";
import { clockToSeconds, secondsToClock } from "../Clock";
import { ID } from "../CustomTypes";
import { Authenticated, useAuthentication } from "../providers/Authentication";
import { colors } from "../TaktTheme";
import { Button } from "./Button";
import { Column, Row } from "./Flex";
import { Tooltip } from "./Tooltip";
import { Text } from "./Typography";
import { TimerCard_StartRecordingMutation } from "./__generated__/TimerCard_StartRecordingMutation.graphql";
import { TimerCard_StopRecordingMutation } from "./__generated__/TimerCard_StopRecordingMutation.graphql";
import { TimerCard_Timer$key } from "./__generated__/TimerCard_Timer.graphql";

export const TimerCard = (props: {
  timer: TimerCard_Timer$key;
  onEdit: (timer: { id: ID; seconds: number }) => void;
  onDelete: (timer: { id: ID; seconds: number }) => void;
  currentRecordingId?: ID;
}) => {
  const auth = useAuthentication() as Authenticated;
  const timer = useFragment(
    graphql`
      fragment TimerCard_Timer on Timer {
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

  const [startRecording, startRecordingInFlight] =
    useMutation<TimerCard_StartRecordingMutation>(graphql`
      mutation TimerCard_StartRecordingMutation($timerId: ID!) {
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
    useMutation<TimerCard_StopRecordingMutation>(graphql`
      mutation TimerCard_StopRecordingMutation($timerId: ID!) {
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

  let diff =
    timer.status === "recording"
      ? moment().diff(moment(timer.updatedAt), "seconds")
      : 0;
  if (diff < 0) diff = 0;
  const clock = secondsToClock(timer.seconds + diff);

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
          </Column>
          <Row alignItems="center" gap="smaller">
            <Row alignItems="flex-end">
              <Text fontSize="large">
                {clock.hours}:{clock.minutes}
              </Text>
            </Row>
            <Tooltip title="Toggle recording" placement="bottom-end">
              <RecordButton
                recording={timer.status === "recording"}
                onClick={() => {
                  if (startRecordingInFlight || stopRecordingInFlight) {
                    return;
                  }

                  if (timer.status === "recording") {
                    const optimisticResponse: TimerCard_StopRecordingMutation["response"] =
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
                    const optimisticResponse: TimerCard_StartRecordingMutation["response"] =
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
            </Tooltip>
          </Row>
        </Row>

        <Column
          style={{ borderLeft: `1px solid ${colors.gray}` }}
          paddingHorizontal="tiny"
        >
          <Text
            fontSize="detail"
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
              color: timer.notes ? colors.darkGray : colors.gray,
            }}
          >
            {timer.notes || "No notes"}
          </Text>
        </Column>

        <Row gap="tiny">
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              props.onEdit({ id: timer.id, seconds: clockToSeconds(clock) });
            }}
          >
            Edit
          </Button>
          <Button
            variant="text"
            color="warning"
            size="small"
            onClick={() => {
              props.onDelete({ id: timer.id, seconds: clockToSeconds(clock) });
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
