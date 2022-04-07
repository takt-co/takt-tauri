import React from "react"
import { Button as MaterialButton, ButtonProps, CircularProgress, SxProps, Theme } from "@mui/material"
import { Color, colors, darken } from "../Theme";
import { FontSize, fontSizes } from "./Typography";

export type ButtonVariant = "text" | "contained" | "outlined";

export const Button = (props: Omit<ButtonProps, "color"> & {
  loading?: boolean;
  color?: Color;
  fontSize?: FontSize;
}) => {
  const { loading, color, fontSize, startIcon, ...rest } = props;

  let styles: SxProps<Theme> = {
    fontSize: fontSizes[fontSize ?? "detail"]
  };

  if (props.variant === "contained") {
    styles = {
      ...styles,
      backgroundColor: colors[color ?? "primary"],
      "&:hover": {
        backgroundColor: darken(color ?? "primary", 0.1),
      }
    }
  }

  if (props.variant === "outlined") {
    styles = {
      ...styles,
      borderColor: colors[color ?? "primary"],
      color: colors[color ?? "primary"],
      "&:hover": {
        borderColor: darken(color ?? "primary", 0.1),
        backgroundColor: colors.white,
      }
    }
  }

  if (props.variant === "text") {
    styles = {
      ...styles,
      color: colors[color ?? "primary"],
    }
  }

  return (
    <MaterialButton
      sx={styles}
      startIcon={
        props.loading ? (
          <CircularProgress
            size={12}
            sx={{
              svg: {
                color: props.variant === "contained" ? colors.white : colors.primary,
                width: 12,
              }
            }}
          />
        ) : props.startIcon
      }
      {...rest}
    />
  )
}
