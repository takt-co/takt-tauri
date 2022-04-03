import { CSSProperties, forwardRef, ReactNode } from "react";
import { spacing, Spacing } from "./Spacer";

export type FlexProps = {
  alignItems?: CSSProperties["alignItems"];
  justifyContent?: CSSProperties["justifyContent"];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  flex?: CSSProperties["flex"];
  fullWidth?: boolean;
  fullHeight?: boolean;
  gap?: Spacing;
  onClick?: () => void;
  padding?: Spacing;
  paddingHorizontal?: Spacing;
  paddingVertical?: Spacing;
  shrink?: CSSProperties["flexShrink"];
  wrap?: CSSProperties["flexWrap"];
  grow?: CSSProperties["flexGrow"];
  scrollable?: boolean;
};

export const Column = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      alignItems,
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
      shrink,
      style,
      wrap,
      grow,
      scrollable,
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
          alignItems,
          display: "flex",
          flexDirection: "column",
          flexShrink: shrink,
          flexWrap: wrap,
          flexGrow: grow,
          gap: gap ? spacing[gap] : undefined,
          justifyContent,
          padding: padding ? spacing[padding] : undefined,
          overflowY: scrollable ? "auto" : "hidden",
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
  (
    {
      alignItems,
      children,
      className,
      flex,
      fullWidth,
      gap,
      justifyContent,
      onClick,
      padding,
      paddingHorizontal,
      paddingVertical,
      shrink,
      style,
      wrap,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        children={children}
        className={className}
        onClick={onClick}
        ref={ref}
        style={{
          alignItems,
          display: "flex",
          flex,
          flexDirection: "row",
          flexShrink: shrink,
          flexWrap: wrap,
          gap: gap ? spacing[gap] : undefined,
          justifyContent,
          padding: padding ? spacing[padding] : 0,
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
          ...style,
        }}
        {...props}
      />
    );
  },
);
