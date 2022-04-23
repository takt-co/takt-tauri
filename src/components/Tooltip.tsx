import React from "react";
import {
  Fade,
  styled,
  Tooltip as MaterialTooltip,
  tooltipClasses,
  TooltipProps,
  useTheme,
} from "@mui/material";
import { fontSizes } from "./Typography";
import { spacing } from "./Spacer";
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
)(() => {
  const theme = useTheme();

  return {
    pointerEvents: "none",
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.text.secondary,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      fontSize: fontSizes.small,
      padding: `${spacing.tiny}px ${spacing.smaller}px`,
      backgroundColor: theme.palette.text.secondary,
    },
  };
});
