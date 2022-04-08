import React from "react"
import { ListItemText, MenuItem } from "@mui/material"
import { colors } from "../Theme"
import { Column, Row } from "./Flex"
import { CleanUpIcon, IconProps, LoginIcon, PowerIcon } from "./Icons"
import { Text } from "./Typography"
import { Spacer } from "./Spacer"
import { useAuthentication } from "../providers/Authentication"
import { process } from "@tauri-apps/api"

export const SettingsScreen = () => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

  return (
    <Column fullHeight backgroundColor="white">
      <Row padding="small">
        <Text fontSize="large" strong>Settings</Text>
      </Row>
      <Column fullHeight justifyContent="space-between">
        <Column>
          <Setting
            label="Clear cache"
            Icon={CleanUpIcon}
            onClick={() => {
              // TODO: relay cache clear
            }}
          />
          <Setting
            label="Sign out"
            Icon={LoginIcon}
            iconProps={{ width: 14, style: { boxSizing: "content-box", paddingRight: 2 } }}
            onClick={authentication.logout}
          />
        </Column>
        <Column>
          <Setting
            label="Quit app"
            Icon={PowerIcon}
            onClick={() => {
              process.exit();
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
}) => (
  <MenuItem onClick={props.onClick}>
    <Spacer size="tiny" />
    <props.Icon {...{ width: 16, height: 16, fill: colors.black, ...props.iconProps }}  />
    <Spacer size="small" />
    <ListItemText>{props.label}</ListItemText>
  </MenuItem>
);
