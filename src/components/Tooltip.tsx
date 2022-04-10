import React from "react";
import { styled, Tooltip as MaterialTooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { fontSizes } from "./Typography";
import { spacing } from "./Spacer";

export const Tooltip = styled(({ className, ...props }: TooltipProps) => (
  <MaterialTooltip
    arrow
    {...props}
    classes={{ popper: className }}
  />
))(({ theme }) => ({
  pointerEvents: "none",
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: fontSizes.small,
    padding: `${spacing.tiny}px ${spacing.smaller}px`,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
}));
