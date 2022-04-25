import React, { useState } from "react";
import { Column, Row } from "../components/Flex";
import {
  CleanUpIcon,
  IconProps,
  LoginIcon,
  PowerIcon,
  UpdateIcon,
} from "../components/Icons";
import { Text } from "../components/Typography";
import { Spacer } from "../components/Spacer";
import { useAuthentication } from "../providers/Authentication";
import { process } from "@tauri-apps/api";
import { config } from "../config";
import { CircularProgress, useTheme } from "@mui/material";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { LoadingScreen } from "../components/LoadingScreen";
import { useSnacks } from "../providers/Snacks";

export const SettingsScreen = (props: { clearCache: () => void }) => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

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
      <Row padding="small">
        <Text fontSize="large" strong>
          Settings
        </Text>
      </Row>
      <Column fullHeight justifyContent="space-between">
        <Column>
          <Setting
            label={updateStatus === "idle" ? "Check for update" : "Checking..."}
            hint="Check if a newer version of Takt is available"
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
            hint="You won't be signed out"
            Icon={CleanUpIcon}
            disabled={cacheCleared}
            onClick={() => {
              props.clearCache();
              setCacheCleared(true);
            }}
          />
          <Setting
            label="Sign out"
            hint={`Signed in as: ${authentication.currentUser.username}`}
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
  hint?: string;
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
      alignItems={props.hint ? "flex-start" : "center"}
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
      <Column gap="tiny">
        <Text
          color={
            props.disabled
              ? theme.palette.text.disabled
              : theme.palette.text.primary
          }
        >
          {props.label}
        </Text>
        {props.hint && (
          <Text fontSize="small" color={theme.palette.text.disabled}>
            {props.hint}
          </Text>
        )}
      </Column>
    </Row>
  );
};
