# Takt tray app
A React app wrapped in Tauri to create a desktop application.

## Getting started
To begin, you'll need to make sure your local environment is setup to run Rust and Tauri.
See their getting started for help: https://tauri.studio/docs/getting-started/prerequisites/

## Developing
```sh
# Install packages
$ yarn install
# Run Tauri and React app
$ yarn tauri dev
# Fetch an updated schema from the API
$ yarn fetch-schema
# Generate types from the schema
$ yarn generate-types
```

Note: API is expected to be running on port `3030`

# Create a new build
```sh
# Build a production release
$ yarn tauri build
```
