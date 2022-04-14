import React from "react";
import { Column, Row } from "./Flex";
import { TopBar } from "./TopBar";
import { createTeleporter } from "react-teleporter";
import { IconButton } from "@mui/material";
import { colors } from "../TaktTheme";
import { ProjectsIcon } from "./Icons";
import { Tooltip } from "./Tooltip";

export const TopBarRight = createTeleporter();
export const TopBarBelow = createTeleporter();

export const Layout = (props: { children: React.ReactNode }) => {
  return (
    <Column
      style={{
        height: "calc(100vh - 10px)",
        overflow: "hidden",
        borderRadius: 5,
      }}
    >
      <TopBar
        left={
          <Row paddingHorizontal="tiny" alignItems="center">
            <IconButton>
              <Tooltip title="Manage projects" key="Projects" placement="right">
                <ProjectsIcon height={20} fill={colors.white} />
              </Tooltip>
            </IconButton>
          </Row>
        }
        right={<TopBarRight.Target />}
        below={<TopBarBelow.Target />}
      />
      {props.children}
    </Column>
  );
};

Layout.TopBarRight = TopBarRight.Source;
Layout.TopBarBelow = TopBarBelow.Source;
