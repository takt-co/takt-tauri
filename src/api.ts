import axios, { AxiosInstance } from "axios";
import { config } from "./config";

export const api = (token?: string): AxiosInstance => {
  return axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token != undefined ? `Token ${token}` : "",
    },
    timeout: 15000,
  });
};
