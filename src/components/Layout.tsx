import React from "react";
import { Column, Row } from "./Flex";
import { createTeleporter } from "react-teleporter";
import { useTheme } from "@mui/material";

export const TopBar = createTeleporter();

export const Layout = (props: { children: React.ReactNode }) => {
  const theme = useTheme();

  return (
    <Column
      style={{
        height: "calc(100vh - 10px)",
        overflow: "hidden",
        borderRadius: 5,
      }}
    >
      <Row alignItems="center" justifyContent="center">
        <span
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
        <TopBar.Target style={{ width: "100%" }} />
      </Row>

      <Column fullHeight>{props.children}</Column>
    </Column>
  );
};

Layout.TopBar = TopBar.Source;
