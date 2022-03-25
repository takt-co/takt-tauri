import React, { useEffect, useState } from 'react';
import { emit } from '@tauri-apps/api/event';
import { Column, Row } from './components/Flex';
import { colors } from './theme';
import { CalendarIcon } from './components/Icons';
import LogoSrc from "./assets/logo.png";

function App() {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    emit("recording", recording);
  }, [recording]);

  return (
    <Column style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Arrow />
      <TopBar />
      <Content>
        <button onClick={() => {
          setRecording(recording => !recording);
        }}>{recording ? "stop" : "start"}</button>
      </Content>
    </Column>
  );
}

const Arrow = () => {
  return (
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
  );
};

const TopBar = () => {
  return (
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
      <img src={LogoSrc} style={{ height: 20 }} />
      <CalendarIcon height={20} fill={colors.white} />
    </Row>
  );
};

const Content = (props: {
  children: React.ReactNode
}) => {
  return (
    <Column
      alignItems="center"
      justifyContent="center"
      grow={1}
      children={props.children}
      style={{
        background: colors.white,
        borderRadius: "0 0 5px 5px",
      }}
    />
  )
}

export default App;
