import React from "react";
import { DateTime } from "../CustomTypes";
import { Column, Row } from "./Flex";
import { Layout } from "./Layout";
import LogoSrc from "../assets/logo.png";
import { Text } from "./Typography";
import { Button } from "./Button";
import { config } from "../config";
import { colors } from "../TaktTheme";
import { Spacer } from "./Spacer";

export type TaktBuild = {
  version: string;
  url: string;
  releasedAt: DateTime;
};

export const UpdateRequiredScreen = (props: { latestBuild: TaktBuild }) => {
  return (
    <Layout>
      <Layout.TopBarLeft>
        <Row padding="smaller">
          <img alt="Takt" src={LogoSrc} height={20} />
        </Row>
      </Layout.TopBarLeft>

      <Column
        fullHeight
        backgroundColor="white"
        padding="medium"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Text fontSize="large">🚀</Text>
        <Spacer size="small" />
        <Text fontSize="large" strong>
          Update available
        </Text>
        <Spacer size="medium" />
        <Text fontSize="small" color={colors.gray}>
          <strong>Current version:</strong> v{config.version}
        </Text>
        <Spacer size="tiny" />
        <Text fontSize="small" color={colors.gray}>
          <strong>Latest version:</strong> v{props.latestBuild.version}
        </Text>
        <Spacer size="medium" />
        <Button variant="outlined">Update now</Button>
      </Column>
    </Layout>
  );
};
