import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ID, SecureToken } from "../CustomTypes";
import axios, { AxiosInstance } from "axios";
import { config } from "../config";

const tokenStorageKey = "secureToken";

type AuthResponse = {
  data: {
    secureToken: SecureToken;
    currentUserId: ID;
  };
};

export type LoginDetails = { username: string; password: string };

type Loading = {
  tag: "loading";
};

export type Unauthenticated = {
  tag: "unauthenticated";
  login: (loginDetails: LoginDetails) => Promise<boolean>;
};

export type Authenticated = {
  tag: "authenticated";
  secureToken: SecureToken;
  currentUserId: ID;
  logout: () => Promise<void>;
};

type AuthenticationState = Loading | Authenticated | Unauthenticated;

const defaultState: AuthenticationState = {
  tag: "loading" as const,
};

const AuthenticationContext = createContext<AuthenticationState>(defaultState);

const api = (token?: string): AxiosInstance => {
  return axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token != null ? `Token ${token}` : "",
    },
    timeout: 15000,
  });
};

const verifySecureToken: (
  token: SecureToken | null
) => Promise<AuthResponse | null> = async (token) => {
  return new Promise((resolve) => {
    if (!token) {
      return resolve(null);
    }

    api(token)
      .get("/verify")
      .then((resp: AuthResponse) => {
        resolve(resp);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

export const AuthenticationProvider = (props: { children: ReactNode }) => {
  const [state, setState] = useState<AuthenticationState>(defaultState);

  useEffect(() => {
    const currentToken = localStorage.getItem(
      tokenStorageKey
    ) as SecureToken | null;

    const logout = async () => {
      localStorage.clear();
      setState({
        tag: "unauthenticated",
        login,
      });
    };

    const login: (loginDetails: LoginDetails) => Promise<boolean> = async (
      loginDetails
    ) => {
      return new Promise((resolve) => {
        api()
          .post("/authorise", loginDetails)
          .then((resp) => {
            const { secureToken, currentUserId } = resp.data;

            if (secureToken) {
              localStorage.setItem(tokenStorageKey, secureToken);
              setState({
                tag: "authenticated",
                secureToken,
                currentUserId,
                logout,
              });
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch(() => {
            resolve(false);
          });
      });
    };

    verifySecureToken(currentToken).then((auth) => {
      if (auth?.data.secureToken) {
        localStorage.setItem(tokenStorageKey, auth.data.secureToken);
        setState({
          tag: "authenticated",
          secureToken: auth.data.secureToken,
          currentUserId: auth.data.currentUserId,
          logout,
        });
      } else {
        setState({
          tag: "unauthenticated",
          login,
        });
      }
      return;
    });
  }, []);

  return (
    <AuthenticationContext.Provider value={state}>
      {props.children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => useContext(AuthenticationContext);
