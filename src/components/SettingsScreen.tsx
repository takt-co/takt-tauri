import React, { useState } from "react"
import { colors } from "../Theme"
import { Column, Row } from "./Flex"
import { CleanUpIcon, IconProps, LoginIcon, PowerIcon } from "./Icons"
import { Text } from "./Typography"
import { Spacer } from "./Spacer"
import { useAuthentication } from "../providers/Authentication"
import { process } from "@tauri-apps/api"
import { config } from "../config"

export const SettingsScreen = (props: {
  clearCache: () => void;
}) => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

  const [cacheCleared, setCacheCleared] = useState(false);

  return (
    <Column fullHeight backgroundColor="white">
      <Row padding="small">
        <Text fontSize="large" strong>Settings</Text>
      </Row>
      <Column fullHeight justifyContent="space-between">
        <Column>
          <Setting
            label={cacheCleared ? "Cache cleared" : "Clear cache"}
            Icon={CleanUpIcon}
            disabled={cacheCleared}
            onClick={() => {
              props.clearCache();
              setCacheCleared(true);
            }}
          />
          <Setting
            label="Sign out"
            Icon={LoginIcon}
            iconProps={{ width: 16, style: { boxSizing: "content-box", paddingRight: 4 } }}
            onClick={authentication.logout}
          />
        </Column>
        <Column>
          <Setting
            label="Quit app"
            Icon={PowerIcon}
            onClick={() => {
              if (config.isDevelopment) {
                window.alert("Quit disabled in development mode");
              } else {
                process.exit();
              }
             }}
          />
          <Spacer size="small" />
        </Column>
      </Column>
    </Column>
  )
}

const Setting = (props: {
  label: String;
  Icon: React.FunctionComponent<IconProps>;
  onClick: () => void;
  iconProps?: IconProps;
  disabled?: boolean;
  helperText?: string;
}) => (
  <Row
    padding="small"
    gap="small"
    alignItems="center"
    fullWidth
    onClick={props.onClick}
    hoverStyle={{ cursor: "pointer", backgroundColor: colors.offWhite }}
  >
    <props.Icon
      {...{
        width: 20,
        height: 20,
        fill: props.disabled ? colors.gray : colors.darkGray,
        ...props.iconProps
      }}
    />
    <Text color={props.disabled ? colors.gray : colors.darkGray}>
      {props.label}
    </Text>
  </Row>
);
