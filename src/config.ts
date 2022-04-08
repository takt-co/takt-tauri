export const isDevelopment = process.env.NODE_ENV === "development";

const production = {
  dateFormat: "YYYY-MM-DD",
  apiBaseUrl: "https://api.takt.co",
  isDevelopment,
};

const development = {
  ...production,
  apiBaseUrl: "http://localhost:3030"
};

export const config = isDevelopment ? development : production;