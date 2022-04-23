import { useTheme } from "@mui/material";
import React from "react";
import { FlexProps, Row } from "./Flex";

export const ButtonBar = ({
  style,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref,
  ...rest
}: FlexProps) => {
  const theme = useTheme();
  return (
    <Row
      alignItems="center"
      justifyContent="space-between"
      padding="smaller"
      gap="smaller"
      style={{
        borderTop: `1px solid ${theme.palette.divider}`,
        ...style,
      }}
      {...rest}
    />
  );
};
