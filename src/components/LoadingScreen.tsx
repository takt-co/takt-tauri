import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Column } from "./Flex";
import { colors } from "../TaktTheme";
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
      backgroundColor="white"
      gap="small"
    >
      <CircularProgress
        thickness={5}
        size={30}
        sx={{ circle: { stroke: colors.gray } }}
      />
      {props.message && <Text color={colors.gray}>{props.message}</Text>}
    </Column>
  );
};
