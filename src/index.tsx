import React, { Suspense, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { RelayEnvironmentProvider } from "react-relay";
import { DialogProvider } from "./providers/Dialog";
import {
  Authenticated,
  AuthenticationProvider,
  useAuthentication,
} from "./providers/Authentication";
import { createRelayEnvironment } from "./providers/Relay";
import { LoadingScreen } from "./components/LoadingScreen";
import { Unauthenticated as UnauthenticatedScreen } from "./Unauthenticated";
import App from "./App";
import { Column } from "./components/Flex";
import { TopBar } from "./components/TopBar";

const Takt = () => {
  const auth = useAuthentication();

  switch (auth.tag) {
    case "loading":
      return <LoadingScreen />;
    case "unauthenticated":
      return <UnauthenticatedScreen />;
    case "authenticated":
      return <AuthenticatedScreen />;
    default:
      throw new Error("Unexpected authentication state");
  }
};

const AuthenticatedScreen = () => {
  const auth = useAuthentication() as Authenticated;

  const [environmentKey, setEnvironmentKey] = useState(0);
  const environment = useMemo(
    () => createRelayEnvironment(auth.secureToken),
    [auth.secureToken, environmentKey]
  );

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense
        fallback={
          <Column
            style={{
              height: "calc(100vh - 10px)",
              overflow: "hidden",
              borderRadius: 5,
            }}
          >
            <TopBar />
            <LoadingScreen message="Loading user" />
          </Column>
        }
      >
        <DialogProvider>
          <App
            clearCache={() => {
              // Incrementing this key will force the environment to be recreated
              setEnvironmentKey((key) => key + 1);
            }}
          />
        </DialogProvider>
      </Suspense>
    </RelayEnvironmentProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AuthenticationProvider>
      <Takt />
    </AuthenticationProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
