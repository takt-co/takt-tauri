import { colord } from "colord";
import { NewType } from "./CustomTypes";

export type HexColor = NewType<string>;

export type Color = keyof typeof colors;

export const darken = (color: Color, amount: number) =>
  colord(colors[color]).darken(amount).toHex() as HexColor;

export const lighten = (color: Color, amount: number) =>
  colord(colors[color]).lighten(amount).toHex() as HexColor;

export const alpha = (color: Color, alpha: number) => {
  const { r, g, b } = colord(colors[color]).toRgb();
  return `rgba(${r},${g},${b},${alpha})`;
};

export const colors = {
  primary: "#20639B" as HexColor,
  darkPrimary: "#173F5F" as HexColor,
  warning: "#ED553B" as HexColor,
  info: "#F6D55C" as HexColor,
  black: "#000000" as HexColor,
  white: "#ffffff" as HexColor,
  offWhite: "#dfe3e8" as HexColor,
  gray: "#9c9c9c" as HexColor,
  darkGray: "#333333" as HexColor,
};
