import React from "react";
import App from "./App";
import { AuthScreen } from "./components/AuthScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { useAuthentication } from "./providers/Authentication";

export const Takt = () => {
  const authentication = useAuthentication();

  if (authentication.tag === "loading") {
    return <LoadingScreen />
  } else if (authentication.tag === "unauthenticated") {
    return <AuthScreen />
  } else {
    return <App />
  }
}
