# Takt Tauri and React

[![Build Status](https://takt.semaphoreci.com/badges/takt-tauri/branches/main.svg?style=shields&key=8ededc6a-36b1-4d2b-ae97-90716424378d)](https://takt.semaphoreci.com/projects/takt-tauri)

A React app wrapped in Tauri to create a desktop application.

## Getting started

To begin, you'll need to make sure your local environment is setup to run Rust and Tauri.
See their getting started for help: https://tauri.studio/docs/getting-started/prerequisites/

## Developing

Note: [`takt-rails`](https://github.com/takt-co/takt-rails) is expected to be running on port `3001` while developing.

```sh
# Install packages
$ yarn install

# Run Tauri and React app
$ yarn tauri dev

# Setup dotenv variables
# - required for `fetch-schema` command
$ cp .env.example .env && code .env

# Fetch an updated schema from the API
$ yarn fetch-schema

# Generate types from the schema
$ yarn generate-types

# Build a production release
$ yarn tauri build
```

#### Setup git hooks (Recommended)

Adding this pre-push hook will ensure CI passes before you can push

```sh
$ echo "yarn test" > .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```
