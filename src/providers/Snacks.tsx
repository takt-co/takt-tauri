import React from "react";
import { Alert, AlertProps } from "@mui/material";
import {
  SnackbarProvider as NotistackbarProvier,
  useSnackbar,
} from "notistack";
import { ReactNode, useMemo } from "react";
import { Text } from "../components/Typography";
import { Button } from "../components/Button";
import { Column, Row } from "../components/Flex";
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
        severity?: AlertProps["severity"];
      }): void {
        snackbar.enqueueSnackbar(args.title, {
          content(key, message) {
            return (
              <Column
                justifyContent="flex-end"
                style={{
                  width: "100%",
                  height: "100vh",
                  paddingBottom: 3,
                }}
                onClick={() => {
                  snackbar.closeSnackbar();
                }}
              >
                <Alert
                  onClick={(ev) => {
                    ev.stopPropagation();
                  }}
                  severity={args.severity}
                  variant="filled"
                  onClose={() => {
                    snackbar.closeSnackbar();
                  }}
                  sx={{ mb: 0 }}
                >
                  <Text strong fontSize="detail">
                    {message}
                  </Text>
                  {args.body && (
                    <>
                      <Spacer size="tiny" />
                      <Text fontSize="detail">{args.body}</Text>
                    </>
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
                            sx={{
                              borderColor: "white",
                              color: "white",
                              ":hover": { borderColor: "white" },
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </Row>
                    </>
                  )}
                </Alert>
              </Column>
            );
          },
        });
      },
      close: snackbar.closeSnackbar,
    }),
    [snackbar]
  );
}
