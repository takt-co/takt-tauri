import React, { useState } from "react";
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
import { CircularProgress, IconButton, useTheme } from "@mui/material";
import { Tooltip } from "./Tooltip";
import { useAppState } from "../providers/AppState";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { LoadingScreen } from "./LoadingScreen";
import { useSnacks } from "../providers/Snacks";

export const SettingsScreen = (props: { clearCache: () => void }) => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

  const { setAppState } = useAppState();
  const snacks = useSnacks();
  const theme = useTheme();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "installing"
  >("idle");

  const handleUpdateError = () => {
    // TODO: error reporting!
    setUpdateStatus("idle");
    snacks.alert({
      title: "Whoops!",
      body: "Something went wrong, please try again later",
      severity: "error",
    });
  };

  if (updateStatus === "installing") {
    return <LoadingScreen message="Installing..." />;
  }

  return (
    <Column fullHeight style={{ background: "white" }}>
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
          Settings
        </Text>
      </Row>
      <Column fullHeight justifyContent="space-between">
        <Column>
          <Setting
            label={updateStatus === "idle" ? "Check for update" : "Checking..."}
            Icon={UpdateIcon}
            onClick={() => {
              setUpdateStatus("checking");
              checkUpdate()
                .then(({ shouldUpdate, manifest }) => {
                  if (shouldUpdate) {
                    snacks.alert({
                      title: "Update available",
                      body: `Would you like to update to v${manifest?.version}?`,
                      severity: "info",
                      actions: [
                        {
                          label: "Update now",
                          onClick: () => {
                            setUpdateStatus("installing");
                            installUpdate()
                              .then(() => {
                                relaunch().catch(handleUpdateError);
                              })
                              .catch(handleUpdateError);
                          },
                        },
                      ],
                    });
                  } else {
                    setUpdateStatus("idle");
                    snacks.alert({
                      title: "Up to date",
                      body: "You are on the latest version.",
                      severity: "info",
                    });
                  }
                })
                .catch(handleUpdateError);
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
            <Text fontSize="small" color={theme.palette.text.disabled}>
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
}) => {
  const theme = useTheme();
  return (
    <Row
      padding="small"
      gap="small"
      alignItems="center"
      fullWidth
      onClick={props.disabled ? undefined : props.onClick}
      hoverStyle={{
        cursor: "pointer",
        backgroundColor: theme.palette.grey[100],
      }}
    >
      {props.loading ? (
        <CircularProgress size={20} />
      ) : (
        <props.Icon
          {...{
            width: 20,
            height: 20,
            fill: props.disabled
              ? theme.palette.text.disabled
              : theme.palette.text.primary,
            ...props.iconProps,
          }}
        />
      )}
      <Column>
        <Text
          color={
            props.disabled ? theme.palette.text.disabled : theme.palette.text.primary
          }
        >
          {props.label}
        </Text>
      </Column>
    </Row>
  );
};
