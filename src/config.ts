export const isDevelopment = process.env.NODE_ENV === "development";

const production = {
  dateFormat: "YYYY-MM-DD",
  apiBaseUrl: "https://takt-rails.herokuapp.com",
  isDevelopment,
};

export type Config = typeof production;

const development = {
  ...production,
  apiBaseUrl: "http://localhost:3001",
};

export const config = isDevelopment ? development : production;
