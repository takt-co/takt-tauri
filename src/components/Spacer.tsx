import React, { DetailedHTMLProps, HTMLAttributes } from "react";
import { spacing, Spacing } from "../theme";

type DivProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const Spacer = ({
  size,
  axis,
  flex,
  style,
  ...props
}: {
  axis?: "horizontal" | "vertical";
  flex?: number;
  size: Spacing;
} & DivProps) => {
  const pixels = spacing[size];
  const width = axis === "vertical" ? 1 : pixels;
  const height = axis === "horizontal" ? 1 : pixels;
  return (
    <span
      style={{
        display: "block",
        flexShrink: 0,
        flex,
        width,
        minWidth: width,
        height,
        minHeight: height,
        ...style,
      }}
      {...props}
    />
  );
};
