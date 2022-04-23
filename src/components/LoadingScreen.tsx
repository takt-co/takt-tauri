import React, { useEffect, useState } from "react";
import { CircularProgress, useTheme } from "@mui/material";
import { Column } from "./Flex";
import { Text } from "./Typography";
import { useIsMounted } from "../hooks/useIsMounted";

export const EmptyWarmdown = () => {
  return <></>;
};

export const LoadingScreen = (props: {
  message?: string;
  Warmdown?: () => JSX.Element;
}) => {
  const isMounted = useIsMounted();
  const theme = useTheme();
  const [warmingDown, setWarmingDown] = useState(Boolean(props.Warmdown));

  useEffect(() => {
    if (!warmingDown) return;

    const timeout = setTimeout(() => {
      if (isMounted.current) {
        setWarmingDown(false);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  });

  if (warmingDown && props.Warmdown) {
    return <props.Warmdown />;
  }

  return (
    <Column
      fullWidth
      fullHeight
      alignItems="center"
      justifyContent="center"
      gap="small"
      style={{
        background: "white"
      }}
    >
      <CircularProgress
        thickness={5}
        size={30}
        sx={{ circle: { stroke: String(theme.palette.grey) } }}
      />
      {props.message && <Text color={theme.palette.grey}>{props.message}</Text>}
    </Column>
  );
};
