import React, { Suspense, useEffect, useState } from "react";
import { Column, Row } from "./components/Flex";
import { colors, darken } from "./Theme";
import { AddIcon, Arrow as ArrowIcon, CalendarIcon, TimerOffIcon } from "./components/Icons";
import { Text } from "./components/Typography";
import LogoSrc from "./assets/logo.png";
import moment from "moment";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import RelayEnvironment from "./RelayEnvironment";
import { App_TimersQuery } from "./__generated__/App_TimersQuery.graphql";
import { graphql } from "babel-plugin-relay/macro";
import { emit } from "@tauri-apps/api/event";
import { Spacer } from "./components/Spacer";
import { Button } from "./components/Button";
import { useDebounced } from "./hooks/useDebounced";
import { secondsToClock } from "./Clock";
import { LoadingScreen } from "./components/LoadingScreen";
import { ButtonBar } from "./components/ButtonBar";
import { TimerForm } from "./components/TimerForm";
import { TimerCard } from "./components/TimerCard";
import { TimerCard_Timer$data } from "./components/__generated__/TimerCard_Timer.graphql";

// TODO: can the type force formatting? "YYYY-MM-DD"
const dateFormat = "YYYY-MM-DD";
type DateString = string;

type AppState = {
  tag: "viewingTimers" | "addingTimer",
} | {
  tag: "editingTimer",
  timer: TimerCard_Timer$data,
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

                <ButtonBar>
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
                </ButtonBar>
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

const Timers = (props: {
  date: DateString;
  onEdit: (timer: TimerCard_Timer$data) => void;
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
            ...TimerCard_Timer
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

export default App;
