export const isDevelopment = process.env.NODE_ENV === "development";

const production = {
  dateFormat: "YYYY-MM-DD",
  apiBaseUrl: "https://takt-rails.herokuapp.com",
  isDevelopment,
  version:
    process.env.REACT_APP_VERSION ?? (process.env.PACKAGE_VERSION as string),
};

type Config = typeof production;

const development: Config = {
  ...production,
  apiBaseUrl: "http://localhost:3001",
};

export const config = isDevelopment ? development : production;
