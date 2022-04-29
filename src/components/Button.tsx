import React from "react";
import {
  Button as MaterialButton,
  ButtonProps,
  CircularProgress,
  SxProps,
  Theme,
  useTheme,
} from "@mui/material";
import { FontSize, fontSizes } from "./Typography";

export type ButtonVariant = "text" | "contained" | "outlined";

export const Button = (
  props: ButtonProps & {
    loading?: boolean;
    fontSize?: FontSize;
  }
) => {
  const theme = useTheme();
  const { loading, fontSize, startIcon, variant, ...rest } = props;

  const styles: SxProps<Theme> = {
    fontSize: fontSizes[fontSize ?? "detail"],
  };

  return (
    <MaterialButton
      sx={styles}
      variant={variant}
      startIcon={
        loading ? (
          <CircularProgress
            size={12}
            sx={{
              svg: {
                color:
                  variant === "contained"
                    ? "white"
                    : theme.palette.primary.main,
                width: 12,
              },
            }}
          />
        ) : (
          startIcon
        )
      }
      {...rest}
    />
  );
};
