import { createContext, useContext } from "react";
import { DateString, ID } from "../CustomTypes";

export type AppState = {
  viewingDate: DateString;
  timerConnections: Array<{
    id: ID;
    date: DateString;
  }>;
} & (
  | {
      tag: "timers" | "addingTimer" | "projects" | "reporting" | "settings";
    }
  | {
      tag: "editingTimer";
      timer: { id: ID };
    }
);

const AppState = createContext<{
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}>({
  appState: {
    tag: "timers",
    viewingDate: "",
    timerConnections: [],
  },
  setAppState: () => {
    // Update state...
  },
});

export const AppStateProvider = AppState.Provider;

export function useAppState() {
  const context = useContext(AppState);
  if (context == null) {
    throw new Error(
      "Used useAppState outside of a component tree warpped in a AppState.Provider"
    );
  }
  return context;
}
