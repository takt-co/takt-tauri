import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { omit } from "lodash";
import { Button, ButtonVariant } from "./Button";
import { ID } from "../Types";
import { Backdrop, Dialog as MaterialDialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Color, colors } from "../Theme";
import { Column } from "./Flex";

type DialogContextType = {
  alert: (config: {
    title: string;
    body?: ReactNode;
    onOk?: () => void;
  }) => void;
  confirm: (config: {
    title: string;
    body: ReactNode;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmColor?: Color;
    confirmVariant?: ButtonVariant;
    onCancel?: () => void;
    onConfirm: () => Promise<void> | void;
  }) => void;
};

type RenderDialogProps = { confirming: boolean; closing: boolean };

type Dialog = {
  id: ID;
  render: (props: RenderDialogProps) => ReactNode;
};

const DialogContext = createContext<DialogContextType>(null!);

export function DialogProvider(props: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<Array<Dialog>>([]);
  const [confirmingDialogs, setConfirmingDialogs] = useState<{
    [key: string]: true;
  }>({});
  const [closingDialogs, setClosingDialogs] = useState<{ [key: string]: true }>(
    {},
  );
  const removeDialog = useCallback((id: ID) => {
    setClosingDialogs((closingDialogs) => ({
      ...closingDialogs,
      [id]: true,
    }));

    // Give the dialog time to fade out
    setTimeout(() => {
      // remove the dialog from our array
      setDialogs((dialogs) => dialogs.filter((dialog) => dialog.id !== id));
      // remove it from the closing state
      setClosingDialogs((closingDialogs) => omit(closingDialogs, id));
    }, 150);
  }, []);

  const value: DialogContextType = useMemo(() => {
    return {
      alert({ title, body, onOk }) {
        setDialogs((dialogs) => {
          const id = Date.now().toString();
          return [
            ...dialogs,
            {
              id,
              render: ({ closing }) => (
                <MaterialDialog
                  key={id}
                  onClose={() => removeDialog(id)}
                  open={!closing}
                >
                  <DialogTitle>{title}</DialogTitle>
                  <DialogContent>{body}</DialogContent>
                  <DialogActions>
                    <Button
                      autoFocus
                      onClick={() => {
                        removeDialog(id);
                        onOk?.();
                      }}
                    >
                      Ok
                    </Button>
                  </DialogActions>
                </MaterialDialog>
              ),
            },
          ];
        });
      },
      confirm({
        title,
        body,
        onConfirm,
        onCancel,
        confirmColor,
        confirmLabel,
        confirmVariant,
        cancelLabel,
      }) {
        const id = Date.now().toString();
        return setDialogs((dialogs) => [
          ...dialogs,
          {
            id,
            render: ({ confirming, closing }: RenderDialogProps) => {
              const handleClose = () => {
                if (confirming) {
                  return;
                }
                removeDialog(id);
                onCancel?.();
              }
              return (
                <MaterialDialog
                  key={id}
                  BackdropComponent={() =>
                    <Backdrop
                      sx={{
                        backgroundColor: "rgba(0,0,0,0.3)",
                        marginTop: "9px",
                        borderRadius: "5px",
                      }}
                      open={!closing}
                      onClick={handleClose}
                    />
                  }
                  onClose={handleClose}
                  open={!closing}
                >
                  <DialogTitle>{title}</DialogTitle>
                  <DialogContent>{body}</DialogContent>
                  <DialogActions>
                    <Button
                      disabled={confirming}
                      onClick={handleClose}
                    >
                      {cancelLabel ?? "Cancel"}
                    </Button>
                    <Button
                      loading={confirming}
                      onClick={() => {
                        if (confirming) {
                          return;
                        }
                        const result = onConfirm() ?? {};
                        if (!("then" in result)) {
                          removeDialog(id);
                        } else {
                          setConfirmingDialogs((confirming) => ({
                            ...confirming,
                            [id]: true,
                          }));
                          (result as Promise<void>).then(() => {
                            setConfirmingDialogs((confirming) =>
                              omit(confirming, id),
                            );
                            removeDialog(id);
                          });
                        }
                      }}
                      color={confirmColor ?? "primary"}
                      variant={confirmVariant ?? "contained"}
                    >
                      {confirmLabel ?? "Confirm"}
                    </Button>
                  </DialogActions>
                </MaterialDialog>
              );
            },
          },
        ]);
      },
    };
  }, [removeDialog]);

  return (
    <DialogContext.Provider value={value}>
      {props.children}

      {dialogs.map((dialog) =>
        dialog.render({
          confirming: confirmingDialogs[dialog.id],
          closing: closingDialogs[dialog.id],
        }),
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context == null) {
    throw new Error(
      "Used useDialog outside of a component tree warpped in a DialogProvider",
    );
  }
  return context;
}
