import React, { useState } from "react";
import { colors } from "../TaktTheme";
import { Column, Row } from "./Flex";
import {
  CleanUpIcon,
  CrossIcon,
  IconProps,
  LoginIcon,
  PowerIcon,
  UpdateIcon,
} from "./Icons";
import { Text } from "./Typography";
import { Spacer } from "./Spacer";
import { useAuthentication } from "../providers/Authentication";
import { process } from "@tauri-apps/api";
import { config } from "../config";
import { Layout } from "./Layout";
import { CircularProgress, IconButton } from "@mui/material";
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
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "installing">("idle");

  const handleUpdateError = (error: Error) => {
    dialog.alert({
      title: "Something went wrong",
      body: error.message,
    });
  };

  if (updateStatus === "installing") {
    return <LoadingScreen message="Installing..." />;
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
            label={updateStatus === "idle" ? "Check for update" : "Checking..."}
            Icon={UpdateIcon}
            disabled={cacheCleared}
            onClick={() => {
              setUpdateStatus("checking");
              checkUpdate().then(({ shouldUpdate, manifest }) => {
                if (shouldUpdate) {
                  dialog.confirm({
                    title: "Update available",
                    body: `Would you like to update to v${manifest?.version}?`,
                    onConfirm: () => {
                      setUpdateStatus("installing");
                      installUpdate().then(() => {
                        relaunch().catch(handleUpdateError);
                      }).catch(handleUpdateError);
                    },
                    onCancel: () => {
                      setUpdateStatus("idle");
                    }
                  });
                } else {
                  dialog.alert({
                    title: "Up to date",
                    body: "You are on the latest version."
                  });
                  setUpdateStatus("idle");
                }
              }).catch(handleUpdateError);
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
  loading?: boolean;
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
    {props.loading ? (
      <CircularProgress size={20} />
    ) : (
      <props.Icon
        {...{
          width: 20,
          height: 20,
          fill: props.disabled ? colors.gray : colors.darkGray,
          ...props.iconProps,
        }}
      />
    )}
    <Column>
      <Text color={props.disabled ? colors.gray : colors.darkGray}>
        {props.label}
      </Text>
    </Column>
  </Row>
);
