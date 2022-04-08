import React, { Suspense, useState } from "react";
import { Column, Row } from "./components/Flex";
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
import { CalendarIcon, SettingsIcon } from "./components/Icons";
import LogoSrc from "./assets/logo.png";
import { IconButton } from "@mui/material";
import { SettingsScreen } from "./components/SettingsScreen";

type AppState = {
  tag: "viewingTimers" | "addingTimer" | "viewingSettings",
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
          <Row paddingHorizontal="smaller">
            <img alt="Takt" src={LogoSrc} style={{ height: 20 }} />
          </Row>
        )}
        right={(
          <Row paddingHorizontal="tiny">
            {state.tag === "viewingTimers" && (
              <IconButton onClick={() => {
                const today = moment();
                today.startOf("day");
                setDate(today.format(config.dateFormat));
              }}>
                <CalendarIcon
                  height={20}
                  fill={colors.white}
                />
              </IconButton>
            )}

            <IconButton onClick={() => {
              setState((prevState) => ({
                tag: prevState.tag === "viewingSettings" ? "viewingTimers" : "viewingSettings"
              }))
            }}>
              <SettingsIcon height={20} fill={colors.white} />
            </IconButton>
          </Row>
        )}
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
        ) : state.tag === "viewingSettings" ? (
          <SettingsScreen />
        ) : state.tag === "viewingTimers" ? (
          null // handled by setting the visible prop on TimersScreen
        ) : (
          // TODO: error reporting!
          <Column fullHeight backgroundColor="white" alignItems="center" justifyContent="center">
            <Text>Error: Unexpected app state</Text>
          </Column>
        )}
      </Suspense>
    </Column>
  );
}

export default App;
