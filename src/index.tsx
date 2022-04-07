import React from 'react';
import ReactDOM from 'react-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import RelayEnvironment from './RelayEnvironment';
import { DialogProvider } from './components/Dialog';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <DialogProvider>
        <App />
      </DialogProvider>
    </RelayEnvironmentProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
