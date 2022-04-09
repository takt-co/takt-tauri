import React from "react";
import { CircularProgress } from "@mui/material"
import { Column } from "./Flex"
import { colors } from "../Theme";
import { Text } from "./Typography";

export const LoadingScreen = (props: {
  message?: string;
}) => {
  return (
    <Column
      fullWidth
      fullHeight
      alignItems="center"
      justifyContent="center"
      backgroundColor="white"
      gap="small"
    >
      <CircularProgress thickness={5} size={30} sx={{ circle: { stroke: colors.gray } }} />
      {props.message && (
        <Text color="gray">{props.message}</Text>
      )}
    </Column>
  )
}
