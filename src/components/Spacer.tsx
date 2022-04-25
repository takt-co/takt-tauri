import React, { DetailedHTMLProps, HTMLAttributes } from "react";

export const spacing = {
  tiny: 4,
  smaller: 10,
  small: 16,
  medium: 24,
  large: 32,
  larger: 48,
  huge: 64,
  gigantic: 96,
};

export type Spacing = keyof typeof spacing;

type DivProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const Spacer = ({
  size,
  vertical,
  horizontal,
  flex,
  style,
  ...props
}: {
  vertical?: boolean;
  horizontal?: boolean;
  flex?: number;
  size?: Spacing;
} & DivProps) => {
  const pixels = spacing[size ?? "small"];
  const width = vertical ? 1 : pixels;
  const height = horizontal ? 1 : pixels;
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
