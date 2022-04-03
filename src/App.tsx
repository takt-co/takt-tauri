import React, { Suspense, useEffect, useState } from "react";
import { Column, FlexProps, Row } from "./components/Flex";
import { colors } from "./Theme";
import { AddIcon, Arrow as ArrowIcon, CalendarIcon } from "./components/Icons";
import { Text } from "./components/Typography";
import LogoSrc from "./assets/logo.png";
import moment, { Moment } from "moment";
import { Button, CircularProgress, Dialog, FormControl, InputLabel, Link, MenuItem, Select, TextField } from "@mui/material";
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
import { Spacer } from "./components/Spacer";

const dateFormFormat = "YYYY-MM-DD";
type Timer = { id?: ID } & TimerAttributes;

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

  return { hours: String(hours), minutes, seconds: secondsStr };
};

type AppState = {
  date: Moment,
} & ({
  tag: "viewingTimers",
} | {
  tag: "addingTimer" | "editingTimer",
  form: Timer,
});

export const App = () => {
  const [state, setState] = useState<AppState>({
    date: moment(),
    tag: "viewingTimers"
  });

  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <Column style={{ width: "100vw", height: "100vh", overflow: "hidden", borderRadius: 5 }}>
        <TopBar
          showCalendarButton={state.tag === "viewingTimers"}
          onCalendarClick={() => { }}
        />

        <Column
          grow={1}
          fullHeight
          style={{ background: colors.white }}
        >
          <Suspense fallback={() => (<LoadingScreen />)}>
            {state.tag === "viewingTimers" ? (
              <>
                <DateBar
                  date={state.date}
                  onDateChange={(date) => {
                    setState((prevState) => ({ ...prevState, date }))
                  }}
                />

                <Suspense fallback={() => (<LoadingScreen />)}>
                  <Timers
                    date={state.date}
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
                          date: prevState.date.format(dateFormFormat),
                          notes: "",
                        }
                      }))
                    }}
                  />
                </Suspense>

                <BottomBar>
                  <AddIcon
                    width={18}
                    fill={colors.gray}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setState((prevState) => (
                        prevState.tag === "viewingTimers" ? {
                          ...prevState,
                          tag: "addingTimer",
                          form: {
                            taskId: "",
                            seconds: 0,
                            date: prevState.date.format(dateFormFormat),
                            notes: "",
                          }
                        } : {
                          ...prevState,
                          tag: "viewingTimers",
                        }
                      ))
                    }}
                  />
                </BottomBar>
              </>
            ) : state.tag === "addingTimer" || state.tag === "editingTimer" ? (
              <TimerForm
                timer={state.form}
                afterSave={(timer) => {
                  setState((prevState) => ({
                    ...prevState,
                    tag: "viewingTimers",
                    date: moment(timer.date)
                  }))
                }}
                onCancel={() => {
                  setState((prevState) => ({ ...prevState, tag: "viewingTimers" }))
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
  date: Moment;
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
    date: props.date.format(dateFormFormat)
  }, {
    // TODO: only refetch after a create/update - fetchKey didn't work as anticipated
    fetchPolicy: "store-and-network",
  });

  useEffect(() => {
    emit("recording", !!data.currentUser.recordingTimer);
  }, [data.currentUser.recordingTimer]);

  const [startRecording] = useMutation<App_StartRecordingMutation>(graphql`
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

  const [stopRecording] = useMutation<App_StopRecordingMutation>(graphql`
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
      <Column fullHeight gap="smaller" justifyContent="center" alignItems="center">
        <Text>No timers on this date</Text>
        <Link
          href="#"
          onClick={props.onAddNew}
        >
          Add new
        </Link>
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
                      // TODO: if currently recording, need to add time since last action
                      seconds: timer.seconds,
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
                  if (recording) {
                    stopRecording({
                      variables: { timerId: timer.id },
                      optimisticResponse: {
                        user: {
                          id: data.currentUser.id,
                          recordingTimer: null,
                        }
                      }
                    })
                  } else {
                    startRecording({
                      variables: { timerId: timer.id },
                      optimisticResponse: {
                        user: {
                          id: data.currentUser.id,
                          recordingTimer: { id: timer.id },
                        }
                      }
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
  onCalendarClick: () => void;
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
        }}
      >
        <img alt="Takt" src={LogoSrc} style={{ height: 20 }} />
        {props.showCalendarButton && (
          <CalendarIcon
            height={20}
            fill={colors.white}
            onClick={props.onCalendarClick}
            style={{ cursor: "pointer" }}
          />
        )}
      </Row>
    </Column>
  );
};

const DateBar = (props: {
  date: Moment,
  onDateChange: (date: Moment) => void;
}) => {
  const { date } = props;
  const dateText = date.isSame(moment(), "day")
    ? "Today" : date.isSame(moment().add(1, "day"), "day")
    ? "Tomorrow" : date.isSame(moment().subtract(1, "day"), "day")
    ? "Yesterday"
    : date.format("dddd, D MMMM YYYY");

  return (
    <Row alignItems="center" justifyContent="space-between" padding="smaller" style={{ background: colors.offWhite, height: 46 }}>
      <ArrowIcon
        width={20}
        style={{
          transform: "rotate(180deg)",
          cursor: "pointer",
        }}
        onClick={() => {
          props.onDateChange(date.subtract(1, "day"));
        }}
      />

      <Text>{dateText}</Text>

      <ArrowIcon
        width={20}
        style={{ cursor: "pointer" }}
        onClick={() => {
          props.onDateChange(date.add(1, "day"));
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
      style={{
        background: colors.white,
        borderRadius: "0 0 5px 5px",
        height: 45,
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

  const [createTimer] = useMutation<App_CreateTimerMutation>(graphql`
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

  const [updateTimer] = useMutation(graphql`
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
    <Column fullHeight alignItems="center" justifyContent="center" padding="small" gap="small">
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

      <Row fullWidth justifyContent="center" gap="small">
        <Button
          variant="outlined"
          onClick={props.onCancel}
          size="small"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
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
      </Row>
    </Column>
  )
}

export default App;
