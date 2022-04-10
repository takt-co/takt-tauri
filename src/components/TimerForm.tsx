import React, { Suspense, useEffect, useState } from "react";
import moment from "moment";
import { useFragment, useLazyLoadQuery, useMutation } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { Column, Row } from "./Flex";
import { Text } from "./Typography";
import {
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { clockToSeconds, secondsToClock } from "../Clock";
import { Button } from "./Button";
import {
  SaveIcon,
  MinusCircled,
  PlusCircled,
  CrossIcon,
} from "../components/Icons";
import { ButtonBar } from "./ButtonBar";
import { colors } from "../TaktTheme";
import {
  CreateTimerAttributes,
  TimerForm_CreateTimerMutation,
} from "./__generated__/TimerForm_CreateTimerMutation.graphql";
import { TimerForm_UpdateTimerMutation } from "./__generated__/TimerForm_UpdateTimerMutation.graphql";
import { ID, NonNull } from "../CustomTypes";
import { Spacer } from "./Spacer";
import { TimerForm_ProjectSelectQuery } from "./__generated__/TimerForm_ProjectSelectQuery.graphql";
import { Layout } from "./Layout";
import { Tooltip } from "./Tooltip";
import { config } from "../config";
import { TimerForm_Timer$data, TimerForm_Timer$key } from "./__generated__/TimerForm_Timer.graphql";

type TimerProject = NonNull<
  TimerForm_ProjectSelectQuery["response"]["currentUser"]["projects"]["edges"][number]["node"]
>;

type TimerAttributes = CreateTimerAttributes & { id?: ID };

export type TimerFormProps = {
  timer?: TimerForm_Timer$data;
  afterSave: (timer: TimerAttributes) => void;
  onCancel: () => void;
};

export const TimerForm = (props: TimerFormProps) => {
  const connectionId = "TODO";

  const defaultAttrs: TimerAttributes = {
    id: props.timer?.id,
    projectId: props.timer?.project.id ?? "",
    notes: props.timer?.notes ?? "",
    date: props.timer?.date ?? moment().format(config.dateFormat),
    seconds: props.timer?.seconds ?? 0,
  };

  const [attributes, setAttributes] = useState(defaultAttrs);

  useEffect(() => {
    setAttributes(defaultAttrs);
  }, [props.timer]);

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
              ...TimerCard_Timer
              ...TimerForm_Timer
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
            ...TimerCard_Timer
            ...TimerForm_Timer
          }
        }
      }
    `);

  return (
    <Column fullHeight backgroundColor="white">
      <Layout.TopBarRight>
        <Row paddingHorizontal="tiny">
          <IconButton onClick={props.onCancel}>
            <Tooltip
              placement="right"
              key="Close"
              title={props.timer ? "Cancel edit" : "Cancel create"}
            >
              <Row>
                <CrossIcon height={20} fill={colors.white} />
              </Row>
            </Tooltip>
          </IconButton>
        </Row>
      </Layout.TopBarRight>

      <Column fullHeight justifyContent="space-around" padding="small">
        <Spacer size="tiny" vertical />

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
              setAttributes((timer) => ({ ...timer, date }));
            }}
          />

          <Suspense
            fallback={
              <TextField
                size="small"
                variant="outlined"
                disabled
                value="Fetching your projects..."
                InputProps={{
                  endAdornment: (
                    <Row>
                      <CircularProgress size={16} />
                    </Row>
                  ),
                }}
              />
            }
          >
            <ProjectSelect
              value={attributes.projectId}
              onChange={(projectId) => {
                setAttributes((timer) => ({ ...timer, projectId }));
              }}
            />
          </Suspense>

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
            rows={6}
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
            if (props.timer) {
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
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...attrs } = attributes;
              createTimer({
                variables: {
                  attributes: attrs,
                  connections: [connectionId],
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

const ProjectSelect = (props: { value: ID; onChange: (value: ID) => void }) => {
  const data = useLazyLoadQuery<TimerForm_ProjectSelectQuery>(
    graphql`
      query TimerForm_ProjectSelectQuery {
        currentUser {
          id
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
    `,
    {}
  );

  const projects = data.currentUser.projects.edges
    .map((e) => e.node)
    .filter(Boolean) as ReadonlyArray<TimerProject>;

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Project</InputLabel>
      <Select
        value={props.value}
        size="small"
        label="Project"
        onChange={(ev) => {
          props.onChange(ev.target.value);
        }}
      >
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
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

export const EditTimerForm = (props: TimerFormProps & {
  timerKey: TimerForm_Timer$key;
}) => {
  console.log("Edit timer");

  const data = useFragment(
    graphql`
      fragment TimerForm_Timer on Timer {
        id
        date
        seconds
        notes
        updatedAt
        project {
          id
        }
      }
    `,
    props.timerKey
  );

  const { timer, ...rest } = props;
  return <TimerForm {...rest} timer={data} />;
};