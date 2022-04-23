import React from "react";
import {
  Button as MaterialButton,
  ButtonProps,
  CircularProgress,
  SxProps,
  Theme,
} from "@mui/material";
import { alpha, Color, colors, darken } from "../TaktTheme";
import { FontSize, fontSizes } from "./Typography";

export type ButtonVariant = "text" | "contained" | "outlined";

export const Button = (
  props: Omit<ButtonProps, "color"> & {
    loading?: boolean;
    color?: Color;
    fontSize?: FontSize;
  }
) => {
  const { loading, color, fontSize, startIcon, variant, ...rest } = props;

  let styles: SxProps<Theme> = {
    fontSize: fontSizes[fontSize ?? "detail"],
  };

  if (variant === "contained") {
    styles = {
      ...styles,
      backgroundColor: colors[color ?? "primary"],
      "&:hover": {
        backgroundColor: darken(color ?? "primary", 0.1),
      },
    };
  }

  if (variant === "outlined") {
    styles = {
      ...styles,
      borderWidth: 1,
      borderColor: colors[color ?? "primary"],
      color: colors[color ?? "primary"],
      "&:hover": {
        borderColor: darken(color ?? "primary", 0.1),
        backgroundColor: alpha(color ?? "white", 0.2),
      },
    };
  }

  if (variant === "text") {
    styles = {
      ...styles,
      color: colors[color ?? "primary"],
    };
  }

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
                color: variant === "contained" ? colors.white : colors.primary,
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
