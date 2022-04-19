# Takt Tauri and React

[![Build Status](https://takt.semaphoreci.com/badges/takt-tauri/branches/main.svg?style=shields&key=8ededc6a-36b1-4d2b-ae97-90716424378d)](https://takt.semaphoreci.com/projects/takt-tauri)

A React app wrapped in Tauri to create a desktop application.

### Getting started

To begin, you'll need to make sure your local environment is setup to run Rust and Tauri.
See their getting started for help: https://tauri.studio/docs/getting-started/prerequisites/

Note: [`takt-rails`](https://github.com/takt-co/takt-rails) is expected to be running while developing.

```sh
# Install packages
$ yarn install

# Generate types from the schema
$ yarn generate-types

# Run Tauri and React app
$ yarn tauri dev
```

#### Fetching schema
If you make changes to `takt-rails` which effect the schema, you'll need to fetch a fresh copy for this repo to `generate-types`.

```sh
# FETCH_SCHEMA_TOKEN env var required for fetching schema
$ cp .env.example .env

# Fetch an updated schema from the API
$ yarn fetch-schema
```
