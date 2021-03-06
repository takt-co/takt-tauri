import React, { Suspense, useEffect, useState } from "react";
import moment from "moment";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { graphql } from "babel-plugin-relay/macro";
import { Column, Row } from "../components/Flex";
import { Text } from "../components/Typography";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { clockToSeconds, currentSeconds, secondsToClock } from "../Clock";
import { Button } from "../components/Button";
import { SaveIcon, MinusCircled, PlusCircled } from "../components/Icons";
import { ButtonBar } from "../components/ButtonBar";
import { TimerFormScreen_CreateTimerMutation } from "./__generated__/TimerFormScreen_CreateTimerMutation.graphql";
import { TimerFormScreen_UpdateTimerMutation } from "./__generated__/TimerFormScreen_UpdateTimerMutation.graphql";
import { DateString, ID } from "../CustomTypes";
import { Spacer } from "../components/Spacer";
import { ProjectSelect } from "../components/ProjectSelect";
import {
  TimerFormScreen_Query,
  TimerStatus,
} from "./__generated__/TimerFormScreen_Query.graphql";
import { LoadingScreen } from "../components/LoadingScreen";
import { useAppState } from "../providers/AppState";
import { uniq } from "lodash";
import { config } from "../config";
import { useSnacks } from "../providers/Snacks";

const createTimerMutation = graphql`
  mutation TimerFormScreen_CreateTimerMutation(
    $attributes: CreateTimerAttributes!
  ) {
    createTimer(input: { attributes: $attributes }) {
      timer {
        id
        date
      }
    }
  }
`;

const updateTimerMutation = graphql`
  mutation TimerFormScreen_UpdateTimerMutation(
    $timerId: ID!
    $attributes: UpdateTimerAttributes!
  ) {
    updateTimer(input: { timerId: $timerId, attributes: $attributes }) {
      timer {
        id
        date
        seconds
        notes
        updatedAt
        project {
          id
        }
      }
    }
  }
`;

type TimerFormDefaultValues = {
  status: TimerStatus;
  date: DateString;
  seconds: number;
  notes: string;
} & (
  | {
      timerId: ID;
      projectId: ID;
      updatedAt: DateString;
    }
  | {
      timerId: undefined;
      projectId: undefined;
    }
);

export type TimerFormProps = {
  timerId?: ID;
  defaultValues: TimerFormDefaultValues;
};

type TimerFormAttributes = {
  projectId?: ID;
  date: DateString;
  seconds: number;
  notes: string;
};

export const TimerFormScreen = ({ defaultValues }: TimerFormProps) => {
  const { appState, setAppState } = useAppState();
  const theme = useTheme();
  const snacks = useSnacks();

  const [createTimer, createTimerInFlight] =
    useMutation<TimerFormScreen_CreateTimerMutation>(createTimerMutation);
  const [updateTimer, updateTimerInFlight] =
    useMutation<TimerFormScreen_UpdateTimerMutation>(updateTimerMutation);

  const [attributes, setAttributes] = useState<TimerFormAttributes>();
  const [displaySeconds, setDisplaySeconds] = useState<number>(
    currentSeconds({
      seconds: defaultValues.seconds,
      status: defaultValues.status,
      updatedAt: defaultValues.timerId ? defaultValues.updatedAt : null,
    })
  );

  // When the form default values change, set form attributes
  useEffect(() => {
    setAttributes({
      projectId: defaultValues.projectId ?? undefined,
      date: defaultValues.date,
      seconds: defaultValues.seconds,
      notes: defaultValues.notes,
    });
  }, [defaultValues]);

  // Keep display in sync with form
  useEffect(() => {
    if (attributes) {
      setDisplaySeconds(attributes.seconds);
    }
  }, [attributes?.seconds]);

  // Tick up the display seconds while recording and time field hasn't been maually changed
  useEffect(() => {
    if (
      defaultValues.status !== "recording" ||
      !defaultValues.timerId ||
      attributes?.seconds !== defaultValues.seconds
    ) {
      return;
    }

    const updateClock = () => {
      setDisplaySeconds(
        currentSeconds({
          status: "recording",
          seconds: attributes.seconds,
          updatedAt: defaultValues.updatedAt,
        })
      );
    };

    updateClock();

    const interval = setInterval(() => {
      if (attributes?.seconds === defaultValues.seconds) {
        updateClock();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [defaultValues, attributes]);

  // Preferred over `setAttributes` as it will throw error when used before ready
  const updateAttributes = (attrs: {
    date?: DateString;
    projectId?: ID;
    seconds?: number;
    notes?: string;
  }) => {
    setAttributes((timer) => {
      if (!timer) {
        throw new Error(
          "TimerForm: Tried to update a timer attributes before they were set"
        );
      }
      return { ...timer, ...attrs };
    });
  };

  if (!attributes) {
    return <LoadingScreen message="Initalising form" />;
  }

  const afterSave = (viewingDate: DateString) => {
    setAppState((s) => ({ ...s, viewingDate, tag: "timers" }));
  };

  const handleCreate = () => {
    if (defaultValues.timerId) {
      throw new Error("TimerForm: Tried to create a timer that alreadt exists");
    }

    if (!attributes.date) {
      snacks.alert({
        title: "Please add a date",
        severity: "warning",
      });
      return;
    }

    if (!attributes.projectId) {
      snacks.alert({
        title: "Please select a project",
        severity: "warning",
      });
      return;
    }

    createTimer({
      variables: {
        attributes: {
          date: attributes.date,
          projectId: attributes.projectId,
          seconds: displaySeconds,
          notes: attributes.notes ?? "",
        },
      },
      onCompleted: (resp) => {
        if (!resp.createTimer) {
          throw new Error(
            // TODO: FIX THE NULL RETURNS ON THE GRAPH
            "TimerForm: createTimer did not return timer"
          );
        }

        afterSave(resp.createTimer.timer.date);
      },
      updater: (store) => {
        const connection = appState.timerConnections.find(
          (c) => c.date === attributes.date
        );
        if (connection) {
          store.get(connection.id)?.invalidateRecord();
        }
      },
    });
  };

  const handleUpdate = () => {
    if (!defaultValues.timerId) {
      throw new Error("TimerForm: Tried to update a timer without a id");
    }

    if (!attributes.projectId) {
      // TODO: snack error
      return;
    }

    const optimisticResponse: TimerFormScreen_UpdateTimerMutation["response"] =
      {
        updateTimer: {
          timer: {
            id: defaultValues.timerId,
            date: attributes.date,
            seconds: displaySeconds,
            notes: attributes.notes ?? "",
            updatedAt: moment().toISOString(),
            project: {
              id: attributes.projectId,
            },
          },
        },
      };

    updateTimer({
      variables: {
        timerId: defaultValues.timerId,
        attributes: {
          ...attributes,
          seconds: displaySeconds,
        },
      },
      optimisticResponse,
      onCompleted: (resp) => {
        if (!resp.updateTimer?.timer) {
          throw new Error("TimerForm: updateTimer did not return timer");
        }
        afterSave(resp.updateTimer.timer.date);
      },
      updater: (store) => {
        const dates = uniq([attributes.date, defaultValues.date]);
        // if the date was updated
        if (dates.length > 1) {
          appState.timerConnections.forEach((connection) => {
            // force refetch of timers on those dates
            if (dates.includes(connection.date)) {
              store.get(connection.id)?.invalidateRecord();
            }
          });
        }
      },
    });
  };

  return (
    <Column fullHeight style={{ background: "white" }}>
      <Column fullHeight justifyContent="space-around" padding="small">
        <Text fontSize="large" strong>
          {defaultValues.timerId ? "Edit" : "Add"} timer
        </Text>

        <Spacer size="medium" vertical />

        <Column fullHeight justifyContent="space-between">
          <TextField
            fullWidth
            size="small"
            label="Date"
            type="date"
            value={attributes.date}
            onChange={(ev) => {
              updateAttributes({
                date: moment(ev.target.value).format(config.dateFormat),
              });
            }}
          />

          <Suspense
            fallback={
              <TextField
                size="small"
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
              value={attributes.projectId ?? undefined}
              onChange={(projectId) => {
                updateAttributes({ projectId });
              }}
            />
          </Suspense>

          <Row justifyContent="center">
            <TimeInput
              value={displaySeconds}
              onChange={(seconds) => {
                updateAttributes({ seconds });
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
              updateAttributes({ notes: ev.target.value });
            }}
          />
        </Column>
      </Column>

      <ButtonBar>
        <Button
          variant="text"
          onClick={() => {
            setAppState((s) => ({ ...s, tag: "timers" }));
          }}
          size="small"
          disabled={createTimerInFlight || updateTimerInFlight}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          loading={createTimerInFlight || updateTimerInFlight}
          disableElevation
          startIcon={
            <SaveIcon
              width={12}
              height={12}
              fill={theme.palette.common.white}
            />
          }
          size="small"
          color="primary"
          onClick={defaultValues.timerId ? handleUpdate : handleCreate}
        >
          {defaultValues.timerId ? "Update" : "Create"} timer
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
  const theme = useTheme();

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
        <MinusCircled
          width={30}
          height={30}
          fill={theme.palette.primary.main}
        />
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
        <PlusCircled width={30} height={30} fill={theme.palette.primary.main} />
      </Button>
    </Row>
  );
};

export const EditTimerFormScreen = ({
  timerId,
  ...props
}: Omit<TimerFormProps, "defaultValues"> & {
  timerId: ID;
}) => {
  const data = useLazyLoadQuery<TimerFormScreen_Query>(
    graphql`
      query TimerFormScreen_Query($timerId: ID!) {
        node(id: $timerId) {
          __typename
          ... on Timer {
            id
            date
            notes
            status
            seconds
            updatedAt
            project {
              id
            }
          }
        }
      }
    `,
    {
      timerId,
    }
  );

  if (data.node?.__typename !== "Timer") {
    throw new Error("EditTimerForm: Timer not found by ID");
  }

  return (
    <TimerFormScreen
      {...props}
      defaultValues={{
        timerId: data.node.id,
        status: data.node.status,
        projectId: data.node.project.id,
        date: data.node.date,
        notes: data.node.notes,
        seconds: data.node.seconds,
        updatedAt: data.node.updatedAt,
      }}
    />
  );
};
