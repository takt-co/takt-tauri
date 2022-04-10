import React from "react";
import moment from "moment";
import { DateString } from "../CustomTypes";
import { Row } from "./Flex";
import { Arrow } from "./Icons";
import { Text } from "./Typography";

export const DateBar = (props: {
  date: DateString;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <Row
    alignItems="center"
    justifyContent="space-between"
    padding="smaller"
    backgroundColor="offWhite"
    style={{ height: 46 }}
  >
    <Arrow
      width={20}
      style={{ transform: "rotate(180deg)", cursor: "pointer" }}
      onClick={props.onPrev}
    />
    <Text>{moment(props.date).format("dddd, D MMMM YYYY")}</Text>
    <Arrow width={20} style={{ cursor: "pointer" }} onClick={props.onNext} />
  </Row>
);
