import { CSSProperties, forwardRef, ReactNode, useState } from "react";
import { Color, colors } from "../Theme";
import { spacing, Spacing } from "./Spacer";

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type FlexProps = DivProps & {
  alignItems?: CSSProperties["alignItems"];
  justifyContent?: CSSProperties["justifyContent"];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
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
  forwardRef?: React.ForwardedRef<HTMLDivElement>;
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
      hoverStyle,
      rounded,
      hidden,
      forwardRef,
      ...props
    }: FlexProps,
    ref,
  ) => {
    const [hovering, setHovering] = useState(false);
    const trackingHover = Boolean(hoverStyle);

    return (
      <div
        children={children}
        className={className}
        onMouseOverCapture={trackingHover ? (ev) => {
          setHovering(true);
        } : undefined}
        onMouseOutCapture={trackingHover ? () => {
          setHovering(false);
        } : undefined}
        onClick={onClick}
        ref={forwardRef ?? ref}
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
          ...(hovering ? hoverStyle : {})
        }}
        {...props}
      />
    );
  },
);

export const Row = forwardRef<HTMLDivElement, FlexProps>(
  // localRef if the ref passed from DivProps type
  ({ style, ref: localRef, ...props }, ref) => {
    return <Column
      forwardRef={ref}
      {...props}
      style={{ ...style, flexDirection: "row" }}
    />
  },
);
