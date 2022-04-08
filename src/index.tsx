import React from 'react';
import ReactDOM from 'react-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import RelayEnvironment from './providers/Relay';
import { DialogProvider } from './providers/Dialog';
import { AuthenticationProvider } from './providers/Authentication';
import { Takt } from './Takt';

ReactDOM.render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <AuthenticationProvider>
        <DialogProvider>
          <Takt />
        </DialogProvider>
      </AuthenticationProvider>
    </RelayEnvironmentProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
