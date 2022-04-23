import React from "react";
import { Alert, AlertProps } from "@mui/material";
import {
  SnackbarProvider as NotistackbarProvier,
  useSnackbar,
} from "notistack";
import { ReactNode, useMemo } from "react";
import { Text } from "../components/Typography";
import { Button } from "../components/Button";
import { Row } from "../components/Flex";
import { Spacer } from "../components/Spacer";

export function SnackbarProvider(props: { children: ReactNode }) {
  return (
    <NotistackbarProvier
      maxSnack={1}
      anchorOrigin={{
        horizontal: "center",
        vertical: "bottom",
      }}
    >
      {props.children}
    </NotistackbarProvier>
  );
}

export function useSnacks() {
  const snackbar = useSnackbar();
  return useMemo(
    () => ({
      alert(args: {
        title: string;
        body?: string;
        actions?: Array<{
          label: string;
          onClick: () => void;
        }>;
        severity?: AlertProps["severity"]
      }): void {
        snackbar.enqueueSnackbar(args.title, {
          content(key, message) {
            return (
              <Alert
                severity={args.severity}
                variant="filled"
                onClose={() => {
                  snackbar.closeSnackbar();
                }}
              >
                <Text strong>{message}</Text>
                <Spacer size="tiny" />
                {args.body && (
                  <Text fontSize="detail">{args.body}</Text>
                )}
                {args.actions && args.actions.length > 0 && (
                  <>
                    <Spacer size="small" />
                    <Row gap="small">
                      {(args.actions ?? []).map(({ onClick, label }) => (
                        <Button
                          key={label}
                          onClick={onClick}
                          size="small"
                          variant="outlined"
                          color="white"
                        >
                          {label}
                        </Button>
                      ))}
                    </Row>
                  </>
                )}
              </Alert>
            );
          },
        });
      },
    }),
    [snackbar]
  );
}
