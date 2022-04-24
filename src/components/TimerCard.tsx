import React from "react";
import { graphql } from "babel-plugin-relay/macro";
import moment from "moment";
import { useFragment, useMutation } from "react-relay";
import { clockToSeconds, currentSeconds, secondsToClock } from "../Clock";
import { ID } from "../CustomTypes";
import { Authenticated, useAuthentication } from "../providers/Authentication";
import { Button } from "./Button";
import { Column, Row } from "./Flex";
import { Tooltip } from "./Tooltip";
import { Text } from "./Typography";
import { TimerCard_StartRecordingMutation, TimerCard_StartRecordingMutation$data } from "./__generated__/TimerCard_StartRecordingMutation.graphql";
import { TimerCard_StopRecordingMutation } from "./__generated__/TimerCard_StopRecordingMutation.graphql";
import { TimerCard_Timer$key } from "./__generated__/TimerCard_Timer.graphql";
import { useTheme } from "@mui/material";

export const TimerCard = (props: {
  timer: TimerCard_Timer$key;
  onEdit: (timer: { id: ID; seconds: number }) => void;
  onDelete: (timer: { id: ID; seconds: number }) => void;
  currentRecordingId?: ID;
}) => {
  const auth = useAuthentication() as Authenticated;
  const theme = useTheme();
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

  const seconds = currentSeconds(timer);
  const clock = secondsToClock(seconds);

  return (
    <Row
      key={timer.id}
      style={{ borderBottom: `1px solid ${theme.palette.grey[200]}` }}
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
            <Tooltip
              title={`${
                timer.status === "recording" ? "Stop" : "Start"
              } recording`}
              placement="bottom-end"
            >
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
                              id: auth.currentUser.id,
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
                    const optimisticResponse: TimerCard_StartRecordingMutation$data =
                      {
                        startRecording: {
                          timer: {
                            id: timer.id,
                            status: "recording",
                            seconds: timer.seconds,
                            updatedAt: moment().toISOString(),
                            user: {
                              id: auth.currentUser.id,
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
          style={{ borderLeft: `1px solid ${theme.palette.grey[400]}` }}
          paddingHorizontal="smaller"
        >
          <Text
            fontSize="detail"
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
              color: timer.notes
                ? theme.palette.text.primary
                : theme.palette.text.disabled,
            }}
          >
            {timer.notes || "No notes"}
          </Text>
        </Column>

        <Row gap="smaller">
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
            color="error"
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
  const theme = useTheme();
  return (
    <span
      onClick={props.onClick}
      style={{
        display: "block",
        width: 16,
        height: 16,
        backgroundColor: String(
          props.recording ? theme.palette.error.main : theme.palette.grey[500]
        ),
        borderRadius: 100,
        cursor: "pointer",
      }}
    />
  );
};
