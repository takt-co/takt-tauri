import React from "react";
import { colors } from "../TaktTheme";
import { FlexProps, Row } from "./Flex";

export const ButtonBar = ({
  style,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref,
  ...rest
}: FlexProps) => (
  <Row
    alignItems="center"
    justifyContent="space-between"
    padding="smaller"
    gap="smaller"
    backgroundColor="white"
    style={{
      borderTop: `1px solid ${colors.offWhite}`,
      ...style,
    }}
    {...rest}
  />
);
