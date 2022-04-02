import { NewType } from "./types";

export type HexColor = NewType<string>;

export const colors = {
  primary: "#0066cc" as HexColor,
  black: "#000000" as HexColor,
  white: "#ffffff" as HexColor,
  offWhite: "#dfe3e8" as HexColor,
  gray: "#9c9c9c" as HexColor,
  recording: "#ff0000" as HexColor,
}
