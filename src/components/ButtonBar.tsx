import React from "react";
import { colors } from "../Theme";
import { FlexProps, Row } from "./Flex";

export const ButtonBar = (props: FlexProps) => {
  const { style, ...rest } = props;
  return (
    <Row
      alignItems="center"
      justifyContent="space-between"
      padding="smaller"
      gap="smaller"
      style={{
        background: colors.white,
        borderTop: `1px solid ${colors.offWhite}`,
        ...style,
      }}
      {...rest}
    />
  )
}
