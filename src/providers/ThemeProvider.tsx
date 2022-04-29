import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";
import React from "react";

const theme = createTheme({
  palette: {
    primary: {
      light: "#84B3D7",
      main: "#3778A9",
      dark: "#1E415C",
    },
    warning: {
      main: "#FF751F",
    },
    error: {
      light: "#FE8671",
      main: "#F42601",
      dark: "#A21901",
    },
    success: {
      main: "#00A878",
    },
    info: {
      light: "#84B3D7",
      main: "#3778A9",
      dark: "#1E415C",
    },
  },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};
