import React, { Suspense } from "react";
import { Column, Row } from "./Flex";
import { TopBar } from "./TopBar";
import { createTeleporter } from "react-teleporter";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import { colors } from "../TaktTheme";
import { ProjectsIcon } from "./Icons";

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
            {/* <IconButton>
              <Tooltip title={currentUser.name} key="User" placement="right">
                <Suspense fallback={() => null}>
                  <Avatar
                    alt={currentUser.name}
                    sx={{ width: 26, height: 26, bgcolor: colors.darkPrimary }}
                  />
                </Suspense>
              </Tooltip>
            </IconButton> */}
            <IconButton>
              <Tooltip title="Manage projects" key="Projects" placement="right">
                <Row>
                  <ProjectsIcon height={20} fill={colors.white} />
                </Row>
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
