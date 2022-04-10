import React from "react";
import { Column, Row } from "./Flex";
import { TopBar } from "./TopBar";
import { createTeleporter } from "react-teleporter";
import { Avatar, IconButton } from "@mui/material";
import { colors } from "../TaktTheme";
import { ProjectsIcon } from "./Icons";
import { Tooltip } from "./Tooltip";
import { ID } from "../CustomTypes";

export const TopBarRight = createTeleporter();
export const TopBarBelow = createTeleporter();

export const Layout = (props: {
  user?: {
    id: ID;
    name: string;
  };
  children: React.ReactNode;
}) => {
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
            {props.user && (
              <IconButton>
                <Tooltip title={props.user.name} key="User" placement="right">
                  <Avatar
                    alt={props.user.name}
                    sx={{ width: 26, height: 26, bgcolor: colors.darkPrimary }}
                  />
                </Tooltip>
              </IconButton>
            )}
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
