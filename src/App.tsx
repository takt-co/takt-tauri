import React, { useEffect, useState } from 'react';
import { emit } from '@tauri-apps/api/event';
import { Column, Row } from './components/Flex';
import { colors } from './theme';
import { AddIcon, Arrow as ArrowIcon, CalendarIcon } from './components/Icons';
import LogoSrc from "./assets/logo.png";
import moment from 'moment';
import { Dialog } from '@mui/material';

function App() {
  const [recording, setRecording] = useState(false);
  const [date, setDate] = useState(moment().toJSON());
  const [showingCalendar, setShowingCalendar] = useState(false);

  // Let Tauri know when recording state changes
  useEffect(() => {
    emit("recording", recording);
  }, [recording]);

  return (
    <Column style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopBar onCalendarClick={() => { setShowingCalendar(true) }} />

      <DateBar
        date={date}
        onDateChange={(date: moment.Moment) => {
          setDate(date.toJSON());
        }}
      />

      <Content>
        <button onClick={() => {
          setRecording(recording => !recording);
        }}>{recording ? "stop" : "start"}</button>
      </Content>

      <BottomBar />

      <Dialog
        open={showingCalendar}
        onClose={() => { setShowingCalendar(false) }}
        BackdropComponent={() => <Column />}
      >
        <Column>

        </Column>
      </Dialog>
    </Column>
  );
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
        <img src={LogoSrc} style={{ height: 20 }} />
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
    <Row alignItems="center" justifyContent="space-between" padding="smallest" style={{ background: colors.offWhite, height: 46 }}>
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

      <p>{dateText}</p>

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
      }}
    />
  )
}

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
