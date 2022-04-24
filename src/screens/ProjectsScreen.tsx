import React from "react";
import { Column, Row } from "../components/Flex";
import {
  CrossIcon,
} from "../components/Icons";
import { Text } from "../components/Typography";
import { useAuthentication } from "../providers/Authentication";
import { Layout } from "../components/Layout";
import { IconButton } from "@mui/material";
import { Tooltip } from "../components/Tooltip";
import { useAppState } from "../providers/AppState";

export const ProjectsScreen = () => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

  const { setAppState } = useAppState();

  return (
    <Column fullHeight style={{ background: "white" }}>
      <Layout.TopBarLeft />
      <Layout.TopBarRight>
        <Row paddingHorizontal="tiny">
          <IconButton
            onClick={() => {
              setAppState((s) => ({ ...s, tag: "viewingTimers" }));
            }}
          >
            <Tooltip placement="right" key="Close" title="Close settings">
              <Row>
                <CrossIcon height={20} fill="white" />
              </Row>
            </Tooltip>
          </IconButton>
        </Row>
      </Layout.TopBarRight>

      <Row padding="small">
        <Text fontSize="large" strong>
          Projects
        </Text>
      </Row>
    </Column>
  );
};
