import { createContext, useContext } from "react";
import { DateString, ID } from "../CustomTypes";

export type AppContext = {
  timerConnections: Array<{
    id: ID;
    date: DateString;
  }>;
};

const AppContext = createContext<{
  appContext: AppContext;
  setAppContext: React.Dispatch<React.SetStateAction<AppContext>>;
}>({
  appContext: {
    timerConnections: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAppContext: () => {},
});

export const AppContextProvider = AppContext.Provider;

export function useAppContext() {
  const context = useContext(AppContext);
  if (context == null) {
    throw new Error(
      "Used useAppContext outside of a component tree warpped in a AppContext.Provider"
    );
  }
  return context;
}
