import React from "react";
import {
  Fade,
  styled,
  Tooltip as MaterialTooltip,
  tooltipClasses,
  TooltipProps,
} from "@mui/material";
import { fontSizes } from "./Typography";
import { spacing } from "./Spacer";
import { colors } from "../TaktTheme";
import { Row } from "./Flex";

export const Tooltip = styled(
  ({ className, children, ...props }: TooltipProps) => (
    <MaterialTooltip
      TransitionComponent={Fade}
      arrow
      {...props}
      classes={{ popper: className }}
    >
      <Row>{children}</Row>
    </MaterialTooltip>
  )
)(() => ({
  pointerEvents: "none",
  [`& .${tooltipClasses.arrow}`]: {
    color: colors.darkGray,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: fontSizes.small,
    padding: `${spacing.tiny}px ${spacing.smaller}px`,
    backgroundColor: colors.darkGray,
  },
}));
