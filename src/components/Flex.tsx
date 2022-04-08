import { CSSProperties, forwardRef, ReactNode } from "react";
import { Color, colors } from "../Theme";
import { spacing, Spacing } from "./Spacer";

export type FlexProps = {
  alignItems?: CSSProperties["alignItems"];
  justifyContent?: CSSProperties["justifyContent"];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
  fullHeight?: boolean;
  gap?: Spacing;
  onClick?: () => void;
  padding?: Spacing;
  paddingHorizontal?: Spacing;
  paddingVertical?: Spacing;
  scrollable?: boolean;
  backgroundColor?: Color;
  rounded?: boolean;
  hidden?: boolean;
};

export const Column = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      alignItems,
      backgroundColor,
      children,
      className,
      fullWidth,
      fullHeight,
      gap,
      justifyContent,
      onClick,
      padding,
      paddingHorizontal,
      paddingVertical,
      style,
      rounded,
      hidden,
      ...props
    }: FlexProps,
    ref,
  ) => {
    return (
      <div
        children={children}
        className={className}
        onClick={onClick}
        ref={ref}
        style={{
          margin: 0,
          alignItems,
          display: hidden ? "none" : "flex",
          flexDirection: "column",
          gap: gap ? spacing[gap] : 0,
          justifyContent,
          padding: padding ? spacing[padding] : 0,
          backgroundColor: backgroundColor ? colors[backgroundColor] : undefined,
          borderRadius: rounded ? 5 : 0,
          ...(paddingHorizontal
            ? {
                paddingLeft: spacing[paddingHorizontal],
                paddingRight: spacing[paddingHorizontal],
              }
            : {}),
          ...(paddingVertical
            ? {
                paddingBottom: spacing[paddingVertical],
                paddingTop: spacing[paddingVertical],
              }
            : {}),
          width: fullWidth ? "100%" : undefined,
          height: fullHeight ? "100%" : undefined,
          ...style,
        }}
        {...props}
      />
    );
  },
);

export const Row = forwardRef<HTMLDivElement, FlexProps>(
  ({ style, ...props }, ref) => {
    return <Column
      ref={ref}
      {...props}
      style={{ ...style, flexDirection: "row" }}
    />
  },
);
