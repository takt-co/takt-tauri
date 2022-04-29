import React, { Suspense, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { RelayEnvironmentProvider } from "react-relay";
import {
  Authenticated,
  AuthenticationProvider,
  useAuthentication,
} from "./providers/Authentication";
import { createRelayEnvironment } from "./providers/Relay";
import { LoadingScreen } from "./components/LoadingScreen";
import { Unauthenticated as UnauthenticatedScreen } from "./Unauthenticated";
import { App } from "./App";
import { Column, Row } from "./components/Flex";
import ErrorBoundary from "./ErrorBoundry";
import { Layout } from "./components/Layout";
import LogoSrc from "./assets/logo.png";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { SnackbarProvider } from "./providers/Snacks";
import { ThemeProvider } from "./providers/ThemeProvider";

Sentry.init({
  dsn: "https://cc6d1d6a31e84f499878486d74402a85@o284609.ingest.sentry.io/6356892",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const Takt = () => {
  const auth = useAuthentication();

  switch (auth.tag) {
    case "loading":
      return <Loading />;
    case "unauthenticated":
      return <UnauthenticatedScreen />;
    case "authenticated":
      return <AuthenticatedScreen />;
    default:
      throw new Error("Unexpected authentication state");
  }
};

const Loading = () => (
  <Layout>
    <Layout.TopBar>
      <Row padding="smaller">
        <img alt="Takt" src={LogoSrc} height={20} />
      </Row>
    </Layout.TopBar>
    <LoadingScreen message="Fetching user..." />
  </Layout>
);

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
            <LoadingScreen message="Loading..." />
          </Column>
        }
      >
        <App
          clearCache={() => {
            // Incrementing this key will force the environment to be recreated
            setEnvironmentKey((key) => key + 1);
          }}
        />
      </Suspense>
    </RelayEnvironmentProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <SnackbarProvider>
        <ErrorBoundary>
          <AuthenticationProvider>
            <Takt />
          </AuthenticationProvider>
        </ErrorBoundary>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
