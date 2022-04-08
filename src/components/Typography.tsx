import React from "react"

export const fontSizes = {
  small: 12,
  detail: 14,
  body: 16,
  large: 20,
  xlarge: 28,
}

export type FontSize = keyof typeof fontSizes;

type TextProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> & {
  fontSize?: FontSize;
  strong?: boolean;
};

export const Text = (props: TextProps) => {
  const {
    style,
    strong,
    color,
    fontSize: textFontSize,
    ...rest
  } = props;

  return (
    <p
      style={{
        fontSize: textFontSize ? fontSizes[textFontSize] : fontSizes.body,
        fontWeight: strong ? "bold" : "normal",
        WebkitUserSelect: "none",
        color: color,
        margin: style?.margin ?? 0,
        padding: style?.padding ?? 0,
        ...style
      }}
      {...rest}
    />
  )
}
