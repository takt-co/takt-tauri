import React, { Suspense, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import { DialogProvider } from './providers/Dialog';
import { AuthenticationProvider, useAuthentication } from './providers/Authentication';
import { createRelayEnvironment } from './providers/Relay';
import { LoadingScreen } from './components/LoadingScreen';
import { Unauthenticated } from './Unauthenticated';
import App from './App';
import { Column } from './components/Flex';

const Takt = () => {
  const authentication = useAuthentication();

  switch(authentication.tag) {
    case "loading":
      return <LoadingScreen />
    case "unauthenticated":
      return <Unauthenticated />
    case "authenticated":
      return <Authenticated />
    default:
      throw new Error("Unexpected authentication state");
  }
};

const Authenticated = () => {
  const authentication = useAuthentication();
  const [environmentKey, setEnvironmentKey] = useState(0);
  if (authentication.tag !== "authenticated") {
    throw new Error("Tried to render Authenticated while not logged in");
  }

  const environment = useMemo(() => (
    createRelayEnvironment(authentication.secureToken)
  ), [authentication.secureToken, environmentKey])

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={(
        <Column style={{ height: "calc(100vh - 10px)", overflow: "hidden", borderRadius: 5 }}>
          <LoadingScreen />
        </Column>
      )}>
        <DialogProvider>
          <App
            clearCache={() => {
              // Incrementing this key will force the environment to be recreated
              setEnvironmentKey(key => key + 1);
            }}
          />
        </DialogProvider>
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <AuthenticationProvider>
      <Takt />
    </AuthenticationProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
