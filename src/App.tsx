import React, { Suspense, useEffect, useState } from "react";
import { Column, FlexProps, Row } from "./components/Flex";
import { colors } from "./Theme";
import { AddIcon, Arrow as ArrowIcon, CalendarIcon } from "./components/Icons";
import { Text } from "./components/Typography";
import LogoSrc from "./assets/logo.png";
import moment from "moment";
import { CircularProgress, FormControl, InputLabel, Link, MenuItem, Select, TextField } from "@mui/material";
import { RelayEnvironmentProvider, useLazyLoadQuery, useMutation } from "react-relay";
import RelayEnvironment from "./RelayEnvironment";
import { App_TimersQuery } from "./__generated__/App_TimersQuery.graphql";
import { ID } from "./Types";
import { graphql } from "babel-plugin-relay/macro";
import { emit } from "@tauri-apps/api/event";
import { App_StopRecordingMutation } from "./__generated__/App_StopRecordingMutation.graphql";
import { App_StartRecordingMutation } from "./__generated__/App_StartRecordingMutation.graphql";
import { App_TimerFormQuery } from "./__generated__/App_TimerFormQuery.graphql";
import { App_CreateTimerMutation, TimerAttributes } from "./__generated__/App_CreateTimerMutation.graphql";
import { Spacer, spacing } from "./components/Spacer";
import { Button } from "./components/Button";
import { useDebounced } from "./hooks/useDebounced";

const dateFormat = "YYYY-MM-DD";
type Timer = { id?: ID } & TimerAttributes;

// TODO: can the type force formatting? "YYYY-MM-DD"
type DateString = string;

type Clock = {
  hours: string,
  minutes: string,
  seconds: string
}

const secondsToClock = (seconds: number) => {
  const hours = Math.floor(seconds / 60 / 60);
  seconds = seconds - hours * 60 * 60;

  let mins = Math.floor(seconds / 60);
  if (mins < 0) mins = 0;
  let minutes = String(mins);
  if (minutes.length === 1) minutes = `0${minutes}`;

  let secs = seconds - parseInt(minutes) * 60;
  if (secs < 0) secs = 0;
  let secondsStr = String(secs);
  if (secondsStr.length === 1) secondsStr = `0${secondsStr}`;

  return { hours: String(hours), minutes, seconds: secondsStr } as Clock;
};

const clockToSeconds = (clock: Clock) => {
  const hours = parseInt(clock.hours) * 60 * 60;
  const minutes = parseInt(clock.minutes) * 60;
  return hours + minutes + parseInt(clock.seconds);
}

type AppState = {
  tag: "viewingTimers",
} | {
  tag: "addingTimer" | "editingTimer",
  form: Timer,
};

export const App = () => {
  const [date, setDate] = useState<DateString>(moment().format(dateFormat));
  const [state, setState] = useState<AppState>({
    tag: "viewingTimers"
  });

  useEffect(() => {
    console.log("date changed", date);
  }, [date]);

  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <Column style={{ width: "100vw", height: "100vh", overflow: "hidden", borderRadius: 5 }}>
        <TopBar
          showCalendarButton={state.tag === "viewingTimers"}
          onChangeDate={(date) => {
            setDate(date);
          }}
        />

        <Column
          grow={1}
          fullHeight
          style={{ background: colors.white }}
        >
          <Suspense fallback={<LoadingScreen />}>
            {state.tag === "viewingTimers" ? (
              <>
                <DateBar
                  date={date}
                  onChangeDate={setDate}
                />

                <Suspense fallback={<LoadingScreen />}>
                  <Timers
                    date={date}
                    onEdit={(timer) => {
                      setState((prevState) => ({
                        ...prevState,
                        tag: "editingTimer",
                        form: timer
                      }))
                    }}
                    onAddNew={() => {
                      setState((prevState) => ({
                        ...prevState,
                        tag: "addingTimer",
                        form: {
                          taskId: "",
                          seconds: 0,
                          date,
                          notes: "",
                        }
                      }))
                    }}
                  />
                </Suspense>

                <BottomBar>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      <AddIcon
                        width={12}
                        height={12}
                        fill={colors.primary}
                        style={{ marginLeft: 4 }}
                      />
                    }
                    onClick={() => {
                      setState({
                        tag: "addingTimer",
                        form: {
                          taskId: "",
                          seconds: 0,
                          date,
                          notes: "",
                        }
                      })
                    }}
                  >
                    Add timer
                  </Button>
                </BottomBar>
              </>
            ) : state.tag === "addingTimer" || state.tag === "editingTimer" ? (
              <TimerForm
                timer={state.form}
                afterSave={(timer) => {
                  setDate(timer.date);
                  setState({ tag: "viewingTimers" });
                }}
                onCancel={() => {
                  setState({ tag: "viewingTimers" });
                }}
              />
            ) : (
              <Text>Unexpected app state</Text>
            )}
          </Suspense>
        </Column>
      </Column>
    </RelayEnvironmentProvider>
  );
}

const LoadingScreen = () => {
  return (
    <Column
      fullWidth
      fullHeight
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress />
    </Column>
  )
}

const Timers = (props: {
  date: DateString;
  onEdit: (timer: Timer) => void;
  onAddNew: () => void;
}) => {
  const [timeNow, setTimeNow] = useState(moment());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeNow(moment());
    }, 5000);

    return () => { clearTimeout(timeout) }
  }, [timeNow, setTimeNow]);

  const data = useLazyLoadQuery<App_TimersQuery>(graphql`
    query App_TimersQuery (
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
            notes
            status
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

  const [startRecording, startRecordingInFlight] = useMutation<App_StartRecordingMutation>(graphql`
    mutation App_StartRecordingMutation (
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
          id
          seconds
          lastActionAt
        }
      }
    }
  `);

  const [stopRecording, stopRecordingInFlight] = useMutation<App_StopRecordingMutation>(graphql`
    mutation App_StopRecordingMutation (
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
          id
          seconds
          lastActionAt
        }
      }
    }
  `);

  const timers = data.currentUser.timers.nodes ?? [];

  if (timers.length === 0) {
    return (
      <Column fullHeight justifyContent="center" alignItems="center">
        <Text>No timers on this date</Text>
      </Column>
    )
  }

  return (
    <Column fullHeight fullWidth scrollable>
      {data.currentUser.timers.nodes?.map(timer => {
        if (!timer) return null;

        const recording = data.currentUser.recordingTimer?.id === timer.id;
        const diff = recording ? timeNow.diff(moment(timer.lastActionAt), "seconds") : 0;
        const clock = secondsToClock(timer.seconds + diff);

        return (
          <Row
            key={timer.id}
            style={{ borderBottom: `1px solid ${colors.offWhite}` }}
            justifyContent="space-between"
            alignItems="flex-start"
            padding="small"
          >
            <Column alignItems="flex-start">
              <Text strong>{timer.task.project.name}</Text>
              <Spacer size="tiny" />
              <Text fontSize="detail">{timer.task.name}</Text>
              {timer.notes.length > 0 && (
                <>
                  <Spacer size="small" />
                  <Column style={{ borderLeft: `1px solid ${colors.gray}`}} paddingHorizontal="tiny">
                    <Text fontSize="detail" style={{ whiteSpace: "pre" }}>{timer.notes}</Text>
                  </Column>
                </>
              )}
              <Spacer size="small" />
              <Row gap="tiny">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    props.onEdit({
                      id: timer.id,
                      taskId: timer.task.id,
                      seconds: clockToSeconds(clock),
                      notes: timer.notes,
                      date: timer.date,
                    })
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => {
                    // TODO
                  }}
                >
                  Delete
                </Button>
              </Row>
            </Column>
            <Row alignItems="center" gap="smaller" paddingVertical="tiny">
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
                            id: timer.id,
                            seconds: timer.seconds,
                            lastActionAt: timer.lastActionAt,
                          },
                          user: {
                            id: data.currentUser.id,
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
                            id: timer.id,
                            seconds: timer.seconds,
                            lastActionAt: timer.lastActionAt,
                          },
                          user: {
                            id: data.currentUser.id,
                            recordingTimer: null,
                          },
                        }
                      },
                    })
                  }
                }}
              />
            </Row>
          </Row>
        )
      })}
    </Column>
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

const TopBar = (props: {
  showCalendarButton: boolean;
  onChangeDate: (date: DateString) => void;
}) => {
  return (
    <Column>
      <Row alignItems="center" justifyContent="center">
        <div
          style={{
            display: "inline-block",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderBottom: `10px solid ${colors.primary}`,
            borderRadius: 5,
          }}
        />
      </Row>

      <Row
        justifyContent="space-between"
        alignItems="center"
        padding="smaller"
        style={{
          background: colors.primary,
          height: 46,
          borderRadius: "5px 5px 0 0",
          marginTop: -1,
          WebkitUserSelect: "none",
        }}
      >
        <img alt="Takt" src={LogoSrc} style={{ height: 20 }} />
        {props.showCalendarButton && (
          <CalendarIcon
            height={20}
            fill={colors.white}
            onClick={() => {
              const today = moment().startOf("day");
              props.onChangeDate(today.format(dateFormat));
            }}
            style={{ cursor: "pointer" }}
          />
        )}
      </Row>
    </Column>
  );
};

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
      <ArrowIcon
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

      <ArrowIcon
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

const BottomBar = (props: FlexProps) => {
  const { style, ...rest } = props;
  return (
    <Row
      alignItems="center"
      justifyContent="flex-end"
      padding="smaller"
      gap="smaller"
      style={{
        background: colors.white,
        borderTop: `1px solid ${colors.offWhite}`,
        ...style,
      }}
      {...rest}
    />
  )
}

const TimerForm = (props: {
  timer: Timer;
  afterSave: (timer: Timer) => void;
  onCancel: () => void;
}) => {
  const [internalTimer, setInternalTimer] = useState(props.timer);

  useEffect(() => {
    setInternalTimer(props.timer);
  }, [props.timer]);

  const data = useLazyLoadQuery<App_TimerFormQuery>(graphql`
    query App_TimerFormQuery {
      currentUser {
        id
        projects {
          nodes {
            id
            name
            client {
              id
              name
            }
            tasks {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    }
  `, {});

  const [createTimer, createTimerInFlight] = useMutation<App_CreateTimerMutation>(graphql`
    mutation App_CreateTimerMutation (
      $attributes: TimerAttributes!
    ) {
      createTimer(input: {
        attributes: $attributes
      }) {
        timer {
          id
        }
      }
    }
  `);

  const [updateTimer, updateTimerInFlight] = useMutation(graphql`
    mutation App_UpdateTimerMutation (
      $timerId: ID!
      $attributes: TimerAttributes!
    ) {
      updateTimer(input: {
        timerId: $timerId,
        attributes: $attributes
      }) {
        timer {
          id
        }
      }
    }
  `)

  const projectTasks = data.currentUser.projects!.nodes!.flatMap(project => {
    return project!.tasks.nodes!.map(task => ({
      id: task!.id,
      name: `${project!.name} - ${task!.name}`,
    }))
  })

  return (
    <Column fullHeight>
      <Column fullHeight padding="small" gap="small">
        <Text fontSize="large" strong>{props.timer.id ? "Edit" : "Add"} timer</Text>
        <TextField
          fullWidth
          type="date"
          value={internalTimer.date}
          onChange={(ev) => {
            setInternalTimer((timer) => ({
              ...timer, date: moment(ev.target.value).format("YYYY-MM-DD")
            }))
          }}
        />

        <FormControl fullWidth>
          <InputLabel>Project</InputLabel>
          <Select
            value={internalTimer.taskId}
            label="Project"
            onChange={(ev) => {
              setInternalTimer((t) => ({ ...t, taskId: ev.target.value }))
            }}
          >
            {projectTasks.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Row justifyContent="center">
          <TimeInput
            value={internalTimer.seconds ?? 0}
            onChange={(seconds) => {
              setInternalTimer((t) => ({ ...t, seconds }))
            }}
          />
        </Row>

        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={4}
          value={internalTimer.notes}
          onChange={(ev) => {
            setInternalTimer((t) => ({ ...t, notes: ev.target.value }))
          }}
        />
      </Column>

      <BottomBar>
        <Button
          variant="outlined"
          onClick={props.onCancel}
          size="small"
          disabled={createTimerInFlight || updateTimerInFlight}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          loading={createTimerInFlight || updateTimerInFlight}
          disableElevation
          size="small"
          color="primary"
          onClick={() => {
            const { id: timerId, ...attributes } = internalTimer
            if (timerId) {
              updateTimer({
                variables: { timerId, attributes },
                onCompleted: () => { props.afterSave(internalTimer) },
              })
            } else {
              createTimer({
                variables: { attributes },
                onCompleted: () => { props.afterSave(internalTimer) },
              })
            }
          }}
        >
          Save
        </Button>
      </BottomBar>
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
        variant="contained"
        color="gray"
        size="small"
        fontSize="large"
        onClick={() => {
          let seconds = props.value - 60;
          if (seconds < 0) seconds = 0;
          props.onChange(seconds);
        }}
      >
        -
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
        variant="contained"
        color="gray"
        size="small"
        fontSize="large"
        onClick={() => {
          let seconds = props.value + 60;
          if (seconds > 86399) seconds = 86399; // 24 hrs in seconds (-1 second)
          props.onChange(seconds);
        }}
      >
        +
      </Button>
    </Row>
  )
}

export default App;
