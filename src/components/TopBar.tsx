import React from "react";
import { colors } from "../Theme";
import { Column, Row } from "./Flex";

export const TopBar = (props: {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) => {
  return (
    <Column fullWidth>
      <Row alignItems="center" justifyContent="center" style={{ marginTop: 0 }}>
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
        paddingVertical="smaller"
        backgroundColor="primary"
        style={{
          height: 46,
          borderRadius: "5px 5px 0 0",
          marginTop: -1,
          WebkitUserSelect: "none",
        }}
      >
        <Column>{props.left}</Column>
        <Column>{props.right}</Column>
      </Row>
    </Column>
  );
};