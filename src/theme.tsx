import { colord } from "colord";
import { NewType } from "./Types";

export type HexColor = NewType<string>;

export const colors = {
  primary: "#0066cc" as HexColor,
  black: "#000000" as HexColor,
  white: "#ffffff" as HexColor,
  offWhite: "#dfe3e8" as HexColor,
  gray: "#9c9c9c" as HexColor,
  recording: "#ff0000" as HexColor,
  warning: "#ff0000" as HexColor
}

export type Color = keyof typeof colors;

export const darken = (color: Color, amount: number) => (
  colord(colors[color]).darken(amount).toHex() as HexColor
);

export const lighten = (color: Color, amount: number) => (
  colord(colors[color]).lighten(amount).toHex() as HexColor
);
