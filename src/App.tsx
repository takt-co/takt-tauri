import React, { Suspense, useState } from "react";
import { Column } from "./components/Flex";
import { colors } from "./Theme";
import { Text } from "./components/Typography";
import moment from "moment";
import { LoadingScreen } from "./components/LoadingScreen";
import { TimerForm } from "./components/TimerForm";
import { DateString, ID } from "./Types";
import { TimersScreen } from "./components/TimersScreen";
import { TimersScreen_Timer$data } from "./components/__generated__/TimersScreen_Timer.graphql";
import { config } from "./config";
import { TopBar } from "./components/TopBar";
import { CalendarIcon } from "./components/Icons";
import LogoSrc from "./assets/logo.png";

type AppState = {
  tag: "viewingTimers" | "addingTimer",
} | {
  tag: "editingTimer",
  timer: TimersScreen_Timer$data,
};

export const App = () => {
  const [timersConnectionId, setTimersConnectionId] = useState<ID>("");
  const [date, setDate] = useState<DateString>(moment().format(config.dateFormat));
  const [state, setState] = useState<AppState>({
    tag: "viewingTimers"
  });

  return (
    <Column style={{ height: "calc(100vh - 10px)", overflow: "hidden", borderRadius: 5 }}>
      <TopBar
        left={(
          <img alt="Takt" src={LogoSrc} style={{ height: 20 }} />
        )}
        right={state.tag === "viewingTimers" ? (
          <CalendarIcon
            height={20}
            fill={colors.white}
            onClick={() => {
              const today = moment();
              today.startOf("day");
              setDate(today.format(config.dateFormat));
            }}
            style={{ cursor: "pointer" }}
          />
        ) : undefined}
      />

      <Suspense fallback={<LoadingScreen />}>
        <Column fullHeight hidden={state.tag !== "viewingTimers"}>
          <TimersScreen
            date={date}
            onConnectionIdUpdate={setTimersConnectionId}
            setDate={setDate}
            onAdd={() => {
              setState({ tag: "addingTimer" });
            }}
            onEdit={(timer) => {
              setState({ tag: "editingTimer", timer });
            }}
          />
        </Column>

        {state.tag === "addingTimer" || state.tag === "editingTimer" ? (
          <TimerForm
            date={date}
            setDate={setDate}
            connectionId={timersConnectionId}
            timer={state.tag === "editingTimer" ? state.timer : null}
            afterSave={(timer) => {
              setDate(timer.date);
              setState({ tag: "viewingTimers" });
            }}
            onCancel={() => {
              setState({ tag: "viewingTimers" });
            }}
          />
        ) : state.tag === "viewingTimers" ? (
          null // handled by setting the visible prop on TimersScreen
        ) :  (
          <Text>Unexpected app state</Text>
        )}
      </Suspense>
    </Column>
  );
}

export default App;
