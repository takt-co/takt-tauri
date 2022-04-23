import React, { useState } from "react";
import { DateTime } from "../CustomTypes";
import { Column, Row } from "./Flex";
import { Layout } from "./Layout";
import LogoSrc from "../assets/logo.png";
import { Text } from "./Typography";
import { Button } from "./Button";
import { config } from "../config";
import { Spacer } from "./Spacer";
import { emit } from "@tauri-apps/api/event";
import { useTheme } from "@mui/material";

export type TaktBuild = {
  version: string;
  url: string;
  releasedAt: DateTime;
};

export const UpdateRequiredScreen = (props: { latestBuild: TaktBuild }) => {
  const [updating, setUpdating] = useState(false);
  const theme = useTheme();

  return (
    <Layout>
      <Layout.TopBarLeft>
        <Row padding="smaller">
          <img alt="Takt" src={LogoSrc} height={20} />
        </Row>
      </Layout.TopBarLeft>

      <Column
        fullHeight
        padding="medium"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Text fontSize="large" strong>
          🚀 Update available.
        </Text>
        <Spacer size="medium" />
        <Text fontSize="small" color={theme.palette.grey}>
          <strong>Current version:</strong> v{config.version}
        </Text>
        <Spacer size="tiny" />
        <Text fontSize="small" color={theme.palette.grey}>
          <strong>Latest version:</strong> v{props.latestBuild.version}
        </Text>
        <Spacer size="medium" />
        <Button
          variant="outlined"
          loading={updating}
          disabled={updating}
          onClick={() => {
            setUpdating(true);
            emit("update", props.latestBuild.url);
          }}
        >
          {updating ? "Updating..." : "Update now"}
        </Button>
      </Column>
    </Layout>
  );
};
