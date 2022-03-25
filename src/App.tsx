import React, { Suspense, useState } from 'react';
import { Column, Row } from './components/Flex';
import { colors } from './theme';
import { AddIcon, Arrow as ArrowIcon, CalendarIcon } from './components/Icons';
import LogoSrc from "./assets/logo.png";
import moment from 'moment';
import { Dialog } from '@mui/material';
import { RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay';
import RelayEnvironment from './RelayEnvironment';
import { App_TimersQuery } from './__generated__/App_TimersQuery.graphql';
import { ISO8601Date } from './types';
import { graphql } from "babel-plugin-relay/macro";

function App() {
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

        <Content>
          {/* TODO: loading screen */}
          <Suspense fallback={() => <p>Loading</p>}>
            <Timers date={date} />
          </Suspense>
        </Content>

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

const Timers = (props: {
  date: ISO8601Date;
}) => {
  const data = useLazyLoadQuery<App_TimersQuery>(graphql`
    query App_TimersQuery (
      $date: ISO8601Date!
    ) {
      currentUser {
        id
        timers(endDate: $date, startDate: $date) {
          nodes {
            id
            notes
            status
            seconds
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
  })

  return (
    <>
      {data.currentUser.timers.nodes?.map(timer => (
        <Row
          key={timer!.id}
          justifyContent="space-between"
          padding="small"
          style={{
            borderBottom: `1px solid ${colors.offWhite}`,
          }}
        >
          <Column>
            <p>{timer!.task.project.name}</p>
            <p>{timer!.task.name}</p>
          </Column>
          <Row>
            <p>7:32</p>
          </Row>
        </Row>
      ))}
    </>
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
