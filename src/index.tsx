import React, { Suspense, useEffect, useMemo, useState } from "react";
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
import { App } from "./App";
import { Column, Row } from "./components/Flex";
import { TopBar } from "./components/TopBar";
import ErrorBoundary from "./ErrorBoundry";
import { api } from "./api";
import { config } from "./config";
import { Layout } from "./components/Layout";
import LogoSrc from "./assets/logo.png";
import {
  TaktBuild,
  UpdateRequiredScreen,
} from "./components/UpdateRequiredScreen";

const AppLoadingScreen = (props: { message: string }) => {
  return (
    <Layout>
      <Layout.TopBarLeft>
        <Row padding="smaller">
          <img alt="Takt" src={LogoSrc} height={20} />
        </Row>
      </Layout.TopBarLeft>
      <LoadingScreen message={props.message} />
    </Layout>
  );
};

const Takt = () => {
  const auth = useAuthentication();
  const [latestBuild, setLatestBuild] = useState<TaktBuild>();

  useEffect(() => {
    api()
      .get<TaktBuild>("/")
      .then((resp) => {
        setLatestBuild(resp.data);
      })
      .catch(() => {
        // TODO: error reporting
        setLatestBuild({ version: "0.0.0", url: "", releasedAt: "" });
      });
  }, []);

  const updateAvailable = useMemo(() => {
    if (!latestBuild) return false;

    const [a, b, c] = config.version.split(".").map(parseInt);
    const [x, y, z] = latestBuild.version.split(".").map(parseInt);

    if (x > a) return true;
    if (y > b) return true;
    return z > c;
  }, [latestBuild]);

  if (!latestBuild) {
    return <AppLoadingScreen message="Checking for update..." />;
  }

  if (updateAvailable) {
    return <UpdateRequiredScreen latestBuild={latestBuild} />;
  }

  switch (auth.tag) {
    case "loading":
      return <AppLoadingScreen message="Fetching user..." />;
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
    <ErrorBoundary>
      <AuthenticationProvider>
        <Takt />
      </AuthenticationProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
