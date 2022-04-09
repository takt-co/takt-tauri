import moment from "moment";
import React, { useEffect, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { LoadingScreen } from "./LoadingScreen";
import { Column, Row } from "./Flex";
import { Text } from "./Typography";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { clockToSeconds, secondsToClock } from "../Clock";
import { Button } from "./Button";
import { SaveIcon, MinusCircled, PlusCircled } from "../components/Icons";
import { ButtonBar } from "./ButtonBar";
import { colors } from "../Theme";
import { TimerFormQuery } from "./__generated__/TimerFormQuery.graphql";
import { TimerAttributes, TimerForm_CreateTimerMutation } from "./__generated__/TimerForm_CreateTimerMutation.graphql";
import { TimerForm_UpdateTimerMutation } from "./__generated__/TimerForm_UpdateTimerMutation.graphql";
import { TimersScreen_Timer$data } from "./__generated__/TimersScreen_Timer.graphql";
import { DateString, ID } from "../Types";
import { Spacer } from "./Spacer";

export const TimerForm = (props: {
  date: DateString;
  setDate: (date: DateString) => void;
  timer: TimersScreen_Timer$data | null;
  afterSave: (timer: TimersScreen_Timer$data) => void;
  onCancel: () => void;
  connectionId: ID;
}) => {
  const [internalTimer, setInternalTimer] = useState<TimersScreen_Timer$data | null>(null);

  useEffect(() => {
    setInternalTimer(props.timer ?? {
      id: "",
      notes: "",
      seconds: 0,
      status: "active",
      lastActionAt: moment().toISOString(),
      date: props.date,
      task: {
        id: "",
        name: "",
        project: {
          id: "",
          name: "",
        }
      }
    } as TimersScreen_Timer$data);
  }, [props.timer, props.date]);

  const data = useLazyLoadQuery<TimerFormQuery>(graphql`
    query TimerFormQuery {
      currentUser {
        id
        account {
          projects {
            nodes {
              id
              name
            }
          }
        }
      }
    }
  `, {});

  const [createTimer, createTimerInFlight] = useMutation<TimerForm_CreateTimerMutation>(graphql`
    mutation TimerForm_CreateTimerMutation (
      $attributes: TimerAttributes!
      $connections: [ID!]!
    ) {
      createTimer(input: {
        attributes: $attributes
      }) {
        timer @appendEdge(connections: $connections) {
          cursor
          node {
            id
            ...TimersScreen_Timer
          }
        }
      }
    }
  `);

  const [updateTimer, updateTimerInFlight] = useMutation<TimerForm_UpdateTimerMutation>(graphql`
    mutation TimerForm_UpdateTimerMutation (
      $timerId: ID!
      $attributes: TimerAttributes!
    ) {
      updateTimer(input: {
        timerId: $timerId,
        attributes: $attributes
      }) {
        timer {
          ...TimersScreen_Timer
        }
      }
    }
  `)

  const projectTasks = (data.currentUser.projects.nodes ?? []).flatMap(project => (
    project?.tasks.nodes ?? []).map(task => (
      project && task ? {
        id: task.id,
        name: task.name,
        project: {
          id: project.id,
          name: project.name
        }
      } : null
    )
  ))

  if (!internalTimer) {
    return <LoadingScreen />
  }

  return (
    <Column fullHeight backgroundColor="white">
      <Column fullHeight justifyContent="space-around" padding="small">
        <Text fontSize="large" strong>
          {props.timer ? "Edit" : "Add"} timer
        </Text>

        <Spacer size="medium" vertical />

        <Column fullHeight justifyContent="space-between">
          <TextField
            fullWidth
            size="small"
            label="Date"
            type="date"
            value={internalTimer.date as string}
            onChange={(ev) => {
              const date = moment(ev.target.value).format("YYYY-MM-DD");
              console.log("call set date");
              props.setDate(date);
              setInternalTimer((timer) => (timer ? { ...timer, date } : null))
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Project</InputLabel>
            <Select
              value={internalTimer.task.id}
              size="small"
              label="Project"
              onChange={(ev) => {
                const task = projectTasks.find(t => t && t.id === ev.target.value);
                if (task) {
                  setInternalTimer((timer) => ({ ...timer!, task }));
                }
              }}
            >
              {projectTasks.map(t => t ? (
                <MenuItem key={t.id} value={t.id}><strong>{t.project.name}</strong> - {t.name}</MenuItem>
              ) : null)}
            </Select>
          </FormControl>

          <Row justifyContent="center">
            <TimeInput
              value={internalTimer.seconds ?? 0}
              onChange={(seconds) => {
                setInternalTimer((timer) => ({ ...timer!, seconds }))
              }}
            />
          </Row>

          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={5}
            value={internalTimer.notes}
            onChange={(ev) => {
              setInternalTimer((timer) => ({ ...timer!, notes: ev.target.value }))
            }}
          />
        </Column>
      </Column>

      <ButtonBar>
        <Button
          variant="text"
          onClick={props.onCancel}
          size="small"
          disabled={createTimerInFlight || updateTimerInFlight}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          loading={createTimerInFlight || updateTimerInFlight}
          disableElevation
          startIcon={
            <SaveIcon
              width={12}
              height={12}
              fill={colors.primary}
            />
          }
          size="small"
          color="primary"
          onClick={() => {
            const attributes: TimerAttributes = {
              taskId: internalTimer.task.id,
              date: internalTimer.date,
              notes: internalTimer.notes,
              seconds: internalTimer.seconds,
            }

            if (props.timer) {
              updateTimer({
                variables: { timerId: props.timer.id, attributes },
                optimisticResponse: {
                  updateTimer: {
                    timer: internalTimer
                  }
                },
                onCompleted: () => {
                  props.afterSave(internalTimer);
                }
              })
            } else {
              createTimer({
                variables: {
                  attributes,
                  connections: [props.connectionId],
                },
                onCompleted: () => {
                  props.afterSave(internalTimer);
                }
              })
            }
          }}
        >
          {props.timer ? "Update" : "Create"} timer
        </Button>
      </ButtonBar>
    </Column>
  )
}

const buildTimeOptions = (count: number) => {
  return Array.from(Array(count).keys()).map((num) => {
    let numStr = String(num);
    if (numStr.length === 1) numStr = `0${numStr}`;
    return { label: numStr, value: numStr };
  });
};

const TimeInput = (props: {
  value: number;
  onChange: (seconds: number) => void;
}) => {
  const hourOptions = buildTimeOptions(24);
  const minuteOptions = buildTimeOptions(60);
  const clock = secondsToClock(props.value);

  return (
    <Row fullWidth justifyContent="space-between" alignItems="center" gap="small" paddingHorizontal="tiny">
      <Button
        variant="text"
        color="primary"
        size="small"
        fontSize="large"
        onClick={() => {
          let seconds = props.value - 60;
          if (seconds < 0) seconds = 0;
          props.onChange(seconds);
        }}
      >
        <MinusCircled width={30} height={30} fill={colors.primary} />
      </Button>
      <FormControl fullWidth>
        <InputLabel>Hrs</InputLabel>
        <Select
          size="small"
          value={clock.hours.length === 1 ? `0${clock.hours}` : clock.hours}
          label="Hrs"
          onChange={(ev) => {
            const seconds = clockToSeconds({ ...clock, hours: `${ev.target.value}` });
            props.onChange(seconds)
          }}
        >
          {hourOptions.map(hour => (
            <MenuItem key={hour.value} value={hour.value}>{hour.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Mins</InputLabel>
        <Select
          size="small"
          value={clock.minutes}
          label="Mins"
          onChange={(ev) => {
            const seconds = clockToSeconds({ ...clock, minutes: `${ev.target.value}` });
            props.onChange(seconds)
          }}
        >
          {minuteOptions.map(minute => (
            <MenuItem key={minute.value} value={minute.value}>{minute.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="text"
        color="primary"
        size="small"
        fontSize="large"
        onClick={() => {
          let seconds = props.value + 60;
          if (seconds > 86399) seconds = 86399; // 24 hrs in seconds (-1 second)
          props.onChange(seconds);
        }}
      >
        <PlusCircled width={30} height={30} fill={colors.primary} />
      </Button>
    </Row>
  )
}
