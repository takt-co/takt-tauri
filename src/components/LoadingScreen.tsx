import React from "react";
import { CircularProgress } from "@mui/material"
import { Column } from "./Flex"

export const LoadingScreen = () => {
  return (
    <Column
      fullWidth
      fullHeight
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress />
    </Column>
  )
}
