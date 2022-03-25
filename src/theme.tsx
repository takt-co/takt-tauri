import { NewType } from "./types";

export type HexColor = NewType<string>;

export const colors = {
  primary: "#0066cc" as HexColor,
  black: "#000000" as HexColor,
  white: "#ffffff" as HexColor,
  offWhite: "#f9f9f9" as HexColor,
}

export const spacing = {
  tiny: 4,
  smallest: 8,
  smaller: 12,
  small: 16,
  medium: 24,
  large: 32,
  larger: 48,
  huge: 64,
  gigantic: 96,
};

export type Spacing = keyof typeof spacing;
