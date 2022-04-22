import React, { useState } from "react";
import { colors } from "../TaktTheme";
import { Column, Row } from "./Flex";
import {
  CleanUpIcon,
  CrossIcon,
  IconProps,
  LoginIcon,
  PowerIcon,
} from "./Icons";
import { Text } from "./Typography";
import { Spacer } from "./Spacer";
import { useAuthentication } from "../providers/Authentication";
import { process } from "@tauri-apps/api";
import { config } from "../config";
import { Layout } from "./Layout";
import { IconButton } from "@mui/material";
import { Tooltip } from "./Tooltip";
import { useAppState } from "../providers/AppState";

import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { useDialog } from "../providers/Dialog";
import { LoadingScreen } from "./LoadingScreen";

export const SettingsScreen = (props: { clearCache: () => void }) => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

  const { setAppState } = useAppState();
  const dialog = useDialog();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"idle" | "installing">("idle");

  if (updateStatus === "installing") {
    return <LoadingScreen message="Installing update" />;
  }

  return (
    <Column fullHeight backgroundColor="white">
      <Layout.TopBarRight>
        <Row paddingHorizontal="tiny">
          <IconButton
            onClick={() => {
              setAppState((s) => ({ ...s, tag: "viewingTimers" }));
            }}
          >
            <Tooltip placement="right" key="Close" title="Close settings">
              <Row>
                <CrossIcon height={20} fill={colors.white} />
              </Row>
            </Tooltip>
          </IconButton>
        </Row>
      </Layout.TopBarRight>

      <Row padding="small">
        <Text fontSize="large" strong>
          Settings
        </Text>
      </Row>
      <Column fullHeight justifyContent="space-between">
        <Column>
          <Setting
            Icon={CleanUpIcon}
            label="Check for update"
            onClick={() => {
              checkUpdate().then(({ shouldUpdate, manifest }) => {
                if (shouldUpdate) {
                  dialog.confirm({
                    title: "Update available",
                    body: `Do you want to update to v${manifest?.version}?`,
                    onConfirm: () => {
                      setUpdateStatus("installing");
                      installUpdate().then(() => {
                        relaunch();
                      }).catch((err) => {
                        console.error(err);
                        // TODO: snack error
                        setUpdateStatus("idle");
                      });
                    }
                  });
                }
              });
            }}
          />
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
            iconProps={{
              width: 16,
              style: { boxSizing: "content-box", paddingRight: 4 },
            }}
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
          <Spacer size="tiny" />
          <Row justifyContent="flex-end" paddingHorizontal="smaller">
            <Text fontSize="small" color={colors.gray}>
              v{config.version}
            </Text>
          </Row>
          <Spacer size="smaller" />
        </Column>
      </Column>
    </Column>
  );
};

const Setting = (props: {
  label: string;
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
    onClick={props.disabled ? undefined : props.onClick}
    hoverStyle={{ cursor: "pointer", backgroundColor: colors.offWhite }}
  >
    <props.Icon
      {...{
        width: 20,
        height: 20,
        fill: props.disabled ? colors.gray : colors.darkGray,
        ...props.iconProps,
      }}
    />
    <Text color={props.disabled ? colors.gray : colors.darkGray}>
      {props.label}
    </Text>
  </Row>
);
