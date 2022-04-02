import React, { Suspense, useEffect, useState } from "react";
import { Column, Row } from "./components/Flex";
import { colors } from "./theme";
import { AddIcon, Arrow as ArrowIcon, CalendarIcon } from "./components/Icons";
import { Text } from "./components/Typography";
import LogoSrc from "./assets/logo.png";
import moment from "moment";
import { CircularProgress, Dialog, Link } from "@mui/material";
import { RelayEnvironmentProvider, useLazyLoadQuery, useMutation } from "react-relay";
import RelayEnvironment from "./RelayEnvironment";
import { App_TimersQuery } from "./__generated__/App_TimersQuery.graphql";
import { ISO8601Date } from "./types";
import { graphql } from "babel-plugin-relay/macro";
import { emit } from "@tauri-apps/api/event";
import { App_StopRecordingMutation } from "./__generated__/App_StopRecordingMutation.graphql";
import { App_StartRecordingMutation } from "./__generated__/App_StartRecordingMutation.graphql";

const secondsToClock = (seconds: number) => {
  const hours = Math.floor(seconds / 60 / 60);
  seconds = seconds - hours * 60 * 60;

  let minutes = String(Math.floor(seconds / 60));
  if (minutes.length === 1) minutes = `0${minutes}`;

  let secondsStr = String(seconds - parseInt(minutes) * 60);
  if (secondsStr.length === 1) secondsStr = `0${secondsStr}`;

  return { hours: String(hours), minutes, seconds: secondsStr };
};

export const App = () => {
  const [date, setDate] = useState<ISO8601Date>(moment().toJSON());
  const [showingCalendar, setShowingCalendar] = useState(false);

  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <Column style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <TopBar onCalendarClick={() => { setShowingCalendar(true) }} />

        <DateBar
          date={date}
          onDateChange={(date: moment.Moment) => {
            setDate(date.toJSON());
          }}
        />

        <Column
          grow={1}
          style={{ background: colors.white }}
        >
          <Suspense fallback={() => (<LoadingScreen />)}>
            <Timers date={date} />
          </Suspense>
        </Column>

        <BottomBar />

        <Dialog
          open={showingCalendar}
          onClose={() => { setShowingCalendar(false) }}
          BackdropComponent={() => <Column />}
        >
          <Column>
            {/* TODO: calendar picker */}
          </Column>
        </Dialog>
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
  date: ISO8601Date;
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

  return (
    <>
      {data.currentUser.timers.nodes?.length === 0 && (
        <Column fullHeight gap="smaller" justifyContent="center" alignItems="center">
          <Text>No timers on this date</Text>
          <Link
            href="#"
            onClick={() => {
              // TODO: show form
            }}
          >
            Add new
          </Link>
        </Column>
      )}

      {data.currentUser.timers.nodes?.map(timer => {
        if (!timer) return null;

        const recording = data.currentUser.recordingTimer?.id === timer.id;
        const diff = recording ? timeNow.diff(moment(timer.lastActionAt), "seconds") : 0;
        const clock = secondsToClock(timer.seconds + diff);

        return (
          <Row
            key={timer.id}
            justifyContent="space-between"
            padding="small"
            style={{
              borderBottom: `1px solid ${colors.offWhite}`,
            }}
          >
            <Column gap="tiny">
              <Text strong>{timer.task.project.name}</Text>
              <Text fontSize="detail">{timer.task.name}</Text>
            </Column>
            <Row alignItems="center" gap="smaller">
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
    </>
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
        <CalendarIcon
          height={20}
          fill={colors.white}
          onClick={props.onCalendarClick}
          style={{ cursor: "pointer" }}
        />
      </Row>
    </Column>
  );
};

const DateBar = (props: {
  date: string,
  onDateChange: (date: moment.Moment) => void;
}) => {
  const date = moment(props.date);

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

const BottomBar = () => {
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
      }}
    >
      <AddIcon
        width={18}
        fill={colors.gray}
        style={{
          cursor: "pointer",
        }}
      />
    </Row>
  )
}

export default App;
