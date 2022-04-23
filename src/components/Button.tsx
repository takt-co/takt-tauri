import React from "react";
import {
  Button as MaterialButton,
  ButtonProps,
  CircularProgress,
  SxProps,
  Theme,
} from "@mui/material";
import { FontSize, fontSizes } from "./Typography";

export type ButtonVariant = "text" | "contained" | "outlined";

export const Button = (
  props: ButtonProps & {
    loading?: boolean;
    fontSize?: FontSize;
  }
) => {
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
