import React, { Suspense, useEffect, useState } from "react";
import { Column, FlexProps, Row } from "./components/Flex";
import { colors, darken } from "./Theme";
import { AddIcon, SaveIcon, Arrow as ArrowIcon, CalendarIcon, MinusCircled, PlusCircled, TimerOffIcon } from "./components/Icons";
import { Text } from "./components/Typography";
import LogoSrc from "./assets/logo.png";
import moment from "moment";
import { CircularProgress, FormControl, InputLabel, Link, MenuItem, Select, TextField } from "@mui/material";
import { RelayEnvironmentProvider, useFragment, useLazyLoadQuery, useMutation } from "react-relay";
import RelayEnvironment from "./RelayEnvironment";
import { App_TimersQuery } from "./__generated__/App_TimersQuery.graphql";
import { ID } from "./Types";
import { graphql } from "babel-plugin-relay/macro";
import { emit } from "@tauri-apps/api/event";
import { App_StopRecordingMutation } from "./__generated__/App_StopRecordingMutation.graphql";
import { App_StartRecordingMutation } from "./__generated__/App_StartRecordingMutation.graphql";
import { App_TimerFormQuery } from "./__generated__/App_TimerFormQuery.graphql";
import { App_CreateTimerMutation, TimerAttributes } from "./__generated__/App_CreateTimerMutation.graphql";
import { Spacer } from "./components/Spacer";
import { Button } from "./components/Button";
import { useDebounced } from "./hooks/useDebounced";
import { App_TimerCard_Timer$data, App_TimerCard_Timer$key } from "./__generated__/App_TimerCard_Timer.graphql";
import { App_UpdateTimerMutation } from "./__generated__/App_UpdateTimerMutation.graphql";

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
  tag: "viewingTimers" | "addingTimer",
} | {
  tag: "editingTimer",
  timer: App_TimerCard_Timer$data,
};

export const App = () => {
  const [date, setDate] = useState<DateString>(moment().format(dateFormat));
  const [state, setState] = useState<AppState>({
    tag: "viewingTimers"
  });

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
                      setState({ tag: "editingTimer", timer });
                    }}
                    onAddNew={() => {
                      setState({ tag: "addingTimer" });
                    }}
                  />
                </Suspense>

                <BottomBar>
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
                    onClick={() => {
                      setState({ tag: "addingTimer" })
                    }}
                  >
                    Add timer
                  </Button>
                </BottomBar>
              </>
            ) : state.tag === "addingTimer" || state.tag === "editingTimer" ? (
              <TimerForm
                timer={state.tag === "editingTimer" ? state.timer : null}
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
  onEdit: (timer: App_TimerCard_Timer$data) => void;
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
            seconds
            lastActionAt
            ...App_TimerCard_Timer
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
  timer: App_TimerCard_Timer$key;
  clock: Clock;
  recording: boolean;
  currentUserId: ID;
  onEdit: (timer: App_TimerCard_Timer$data) => void;
  onDelete: () => void;
}) => {
  const { clock, recording, currentUserId } = props;

  const timer = useFragment(graphql`
    fragment App_TimerCard_Timer on Timer {
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
          ...App_TimerCard_Timer
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
          ...App_TimerCard_Timer
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
      justifyContent="space-between"
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
  timer: App_TimerCard_Timer$data | null;
  afterSave: (timer: App_TimerCard_Timer$data) => void;
  onCancel: () => void;
}) => {
  const [internalTimer, setInternalTimer] = useState<App_TimerCard_Timer$data | null>(null);

  useEffect(() => {
    setInternalTimer(props.timer ?? {
      id: "",
      notes: "",
      seconds: 0,
      lastActionAt: moment().toISOString(),
      date: "",
      task: {
        id: "",
        name: "",
        project: {
          id: "",
          name: "",
        }
      }
    } as App_TimerCard_Timer$data);
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
          ...App_TimerCard_Timer
        }
      }
    }
  `);

  const [updateTimer, updateTimerInFlight] = useMutation<App_UpdateTimerMutation>(graphql`
    mutation App_UpdateTimerMutation (
      $timerId: ID!
      $attributes: TimerAttributes!
    ) {
      updateTimer(input: {
        timerId: $timerId,
        attributes: $attributes
      }) {
        timer {
          ...App_TimerCard_Timer
        }
      }
    }
  `)

  const projectTasks = data.currentUser.projects!.nodes!.flatMap(project => {
    return project!.tasks.nodes!.map(task => ({
      id: task!.id,
      name: task!.name,
      project: {
        id: project!.id,
        name: project!.name
      }
    }))
  })

  if (!internalTimer) {
    return <LoadingScreen />
  }

  return (
    <Column fullHeight>
      <Column fullHeight justifyContent="space-between">
        <Column padding="small">
          <Text fontSize="large" strong>
            {props.timer ? "Edit" : "Add"} timer
          </Text>
        </Column>
        <Column fullHeight justifyContent="space-between" padding="small">
          <TextField
            fullWidth
            size="small"
            label="Date"
            type="date"
            value={internalTimer?.date ?? "" as string}
            onChange={(ev) => {
              setInternalTimer((timer) => ({
                ...timer!, date: moment(ev.target.value).format("YYYY-MM-DD")
              }))
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Project</InputLabel>
            <Select
              value={internalTimer.task.id}
              size="small"
              label="Project"
              onChange={(ev) => {
                const task = projectTasks.find(t => t.id === ev.target.value);
                if (task) {
                  setInternalTimer((timer) => ({ ...timer!, task }));
                }
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

      <BottomBar>
        <Button
          variant="text"
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
          startIcon={
            <SaveIcon
              width={10}
              height={10}
              fill={colors.white}
              style={{ marginLeft: 2 }}
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
                    timer: internalTimer!
                  }
                },
              })
            } else {
              createTimer({
                variables: { attributes },
                optimisticResponse: {
                  createTimer: {
                    timer: internalTimer!
                  }
                },
              })
            }

            props.afterSave(internalTimer);
          }}
        >
          {props.timer ? "Update" : "Create"} timer
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

export default App;
