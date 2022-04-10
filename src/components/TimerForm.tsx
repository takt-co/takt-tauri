import React, { useEffect, useState } from "react";
import moment from "moment";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { LoadingScreen } from "./LoadingScreen";
import { Column, Row } from "./Flex";
import { Text } from "./Typography";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { clockToSeconds, secondsToClock } from "../Clock";
import { Button } from "./Button";
import { SaveIcon, MinusCircled, PlusCircled } from "../components/Icons";
import { ButtonBar } from "./ButtonBar";
import { colors } from "../TaktTheme";
import { TimerFormQuery } from "./__generated__/TimerFormQuery.graphql";
import {
  CreateTimerAttributes,
  TimerForm_CreateTimerMutation,
} from "./__generated__/TimerForm_CreateTimerMutation.graphql";
import {
  TimerForm_UpdateTimerMutation,
} from "./__generated__/TimerForm_UpdateTimerMutation.graphql";
import { DateString, ID } from "../CustomTypes";
import { Spacer } from "./Spacer";

type TimerAttributes = CreateTimerAttributes & { id?: ID };

type TimerFormProps = {
  timer: TimerAttributes;
  date: DateString;
  setDate: (date: DateString) => void;
  afterSave: (timer: TimerAttributes) => void;
  onCancel: () => void;
  connectionId: ID;
};

export const TimerForm = (props: TimerFormProps) => {
  const [attributes, setAttributes] = useState<TimerAttributes>(props.timer);

  useEffect(() => {
    setAttributes(props.timer);
  }, [props.timer, props.date]);

  const data = useLazyLoadQuery<TimerFormQuery>(
    graphql`
      query TimerFormQuery {
        currentUser {
          id
          account {
            projects {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    {}
  );

  const [createTimer, createTimerInFlight] =
    useMutation<TimerForm_CreateTimerMutation>(graphql`
      mutation TimerForm_CreateTimerMutation(
        $attributes: CreateTimerAttributes!
        $connections: [ID!]!
      ) {
        createTimer(input: { attributes: $attributes }) {
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

  const [updateTimer, updateTimerInFlight] =
    useMutation<TimerForm_UpdateTimerMutation>(graphql`
      mutation TimerForm_UpdateTimerMutation(
        $timerId: ID!
        $attributes: UpdateTimerAttributes!
      ) {
        updateTimer(input: { timerId: $timerId, attributes: $attributes }) {
          timer {
            ...TimersScreen_Timer
          }
        }
      }
    `);

  const projects =
    data.currentUser.account.projects.edges.map((e) => e.node) ?? [];

  if (!attributes) {
    return <LoadingScreen />;
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
            value={attributes.date as string}
            onChange={(ev) => {
              const date = moment(ev.target.value).format("YYYY-MM-DD");
              console.log("call set date");
              props.setDate(date);
              setAttributes((timer) => ({ ...timer, date }));
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Project</InputLabel>
            <Select
              value={attributes.projectId}
              size="small"
              label="Project"
              onChange={(ev) => {
                const project = projects.find((p) => p?.id === ev.target.value);
                if (project) {
                  setAttributes((timer) => ({ ...timer, project }));
                }
              }}
            >
              {projects.map((p) =>
                p ? (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ) : null
              )}
            </Select>
          </FormControl>

          <Row justifyContent="center">
            <TimeInput
              value={attributes.seconds ?? 0}
              onChange={(seconds) => {
                setAttributes((timer) => ({ ...timer, seconds }));
              }}
            />
          </Row>

          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={5}
            value={attributes.notes}
            onChange={(ev) => {
              setAttributes((timer) => ({ ...timer, notes: ev.target.value }));
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
          startIcon={<SaveIcon width={12} height={12} fill={colors.primary} />}
          size="small"
          color="primary"
          onClick={() => {
            if (props.timer.id) {
              updateTimer({
                variables: {
                  timerId: props.timer.id,
                  attributes,
                },
                optimisticResponse: {
                  updateTimer: {
                    timer: attributes,
                  },
                },
                onCompleted: () => {
                  props.afterSave(attributes);
                },
              });
            } else {
              createTimer({
                variables: {
                  attributes,
                  connections: [props.connectionId],
                },
                onCompleted: () => {
                  props.afterSave(attributes);
                },
              });
            }
          }}
        >
          {props.timer ? "Update" : "Create"} timer
        </Button>
      </ButtonBar>
    </Column>
  );
};

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
    <Row
      fullWidth
      justifyContent="space-between"
      alignItems="center"
      gap="small"
      paddingHorizontal="tiny"
    >
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
            const seconds = clockToSeconds({
              ...clock,
              hours: `${ev.target.value}`,
            });
            props.onChange(seconds);
          }}
        >
          {hourOptions.map((hour) => (
            <MenuItem key={hour.value} value={hour.value}>
              {hour.label}
            </MenuItem>
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
            const seconds = clockToSeconds({
              ...clock,
              minutes: `${ev.target.value}`,
            });
            props.onChange(seconds);
          }}
        >
          {minuteOptions.map((minute) => (
            <MenuItem key={minute.value} value={minute.value}>
              {minute.label}
            </MenuItem>
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
  );
};
