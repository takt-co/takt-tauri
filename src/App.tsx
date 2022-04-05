import React, { Suspense, useState } from "react";
import { Column, Row } from "./components/Flex";
import { colors } from "./Theme";
import { CalendarIcon } from "./components/Icons";
import { Text } from "./components/Typography";
import LogoSrc from "./assets/logo.png";
import moment from "moment";
import { RelayEnvironmentProvider } from "react-relay";
import RelayEnvironment from "./RelayEnvironment";
import { LoadingScreen } from "./components/LoadingScreen";
import { TimerForm } from "./components/TimerForm";
import { DateString } from "./Types";
import { TimersScreen } from "./components/TimersScreen";
import { dateFormat } from "./config";
import { TimersScreen_Timer$data } from "./components/__generated__/TimersScreen_Timer.graphql";

type AppState = {
  tag: "viewingTimers" | "addingTimer",
} | {
  tag: "editingTimer",
  timer: TimersScreen_Timer$data,
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
              <TimersScreen
                date={date}
                setDate={setDate}
                onAdd={() => {
                  setState({ tag: "addingTimer" });
                }}
                onEdit={(timer) => {
                  setState({ tag: "editingTimer", timer });
                }}
              />
            ) : state.tag === "addingTimer" || state.tag === "editingTimer" ? (
              <TimerForm
                date={date}
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

export default App;
