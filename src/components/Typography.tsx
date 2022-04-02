import React from "react"

const fontSize = {
  large: 20,
  body: 16,
  detail: 13,
}

export type FontSize = keyof typeof fontSize;

type TextProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> & {
  fontSize?: FontSize;
  strong?: boolean;
};

export const Text = (props: TextProps) => {
  const {
    style,
    strong,
    fontSize: textFontSize,
    ...rest
  } = props;

  return (
    <p
      style={{
        fontSize: textFontSize ? fontSize[textFontSize] : fontSize.body,
        fontWeight: strong ? "bold" : "normal",
        ...style
      }}
      {...rest}
    />
  )
}
