import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material"
import { Column } from "./Flex"
import { colors } from "../Theme";
import { Text } from "./Typography";
import { useIsMounted } from "../hooks/useIsMounted";

export const LoadingScreen = (props: {
  message?: string;
}) => {
  const isMounted = useIsMounted();
  const [hidden, setHidden] = useState(true);

  // Using a short timeout before showing the loading content
  // this is in an attempt to smooth out transitions when getting quick responses
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isMounted.current) {
        setHidden(false);
      }
    }, 100);

    return () => { clearTimeout(timeout) };
  });

  if (hidden) {
    return <Column fullHeight fullWidth backgroundColor="white" />;
  }

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
