import { useTheme } from "@mui/material";
import React from "react";
import { Column, Row } from "./Flex";

export const TopBar = (props: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  below?: React.ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Column fullWidth>
      <Column fullWidth>
        <Row
          alignItems="center"
          justifyContent="center"
          style={{ marginTop: 0 }}
        >
          <div
            style={{
              display: "inline-block",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: `10px solid ${theme.palette.primary.main}`,
              borderRadius: 5,
            }}
          />
        </Row>
        <Row
          justifyContent="space-between"
          alignItems="center"
          paddingVertical="smaller"
          style={{
            height: 46,
            borderRadius: "5px 5px 0 0",
            marginTop: -1,
            WebkitUserSelect: "none",
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <Column>{props.left}</Column>
          <Column>{props.right}</Column>
        </Row>
      </Column>
      {props.below}
    </Column>
  );
};
