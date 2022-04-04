import React from "react"
import { Button as MaterialButton, ButtonProps, CircularProgress } from "@mui/material"
import { colors } from "../Theme";

export const Button = (props: ButtonProps & {
  loading?: boolean;
}) => {

  return (
    <MaterialButton
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
        ) : null
      }
      {...props}
    />
  )
}
