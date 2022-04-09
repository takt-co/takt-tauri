import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { SecureToken } from "../Types";
import axios, { AxiosInstance } from "axios";
import { config } from "../config";

const tokenStorageKey = "secureToken";

type Authenticated = {
  tag: "authenticated";
  secureToken: SecureToken;
  logout: () => Promise<void>;
};

export type LoginDetails = { username: string, password: string };

type Unauthenticated = {
  tag: "unauthenticated";
  login: (loginDetails: LoginDetails) => Promise<boolean>;
};

type AuthenticationState =
  | { tag: "loading" }
  | Authenticated
  | Unauthenticated;

const AuthenticationContext = createContext<AuthenticationState>({
  tag: "loading",
});

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

const verifySecureToken: (token: SecureToken | null) => Promise<SecureToken | null> = async (token) => {
  return new Promise((resolve) => {
    if (!token) {
      return resolve(null);
    }

    api(token).get("/verify").then(() => {
      resolve(token);
    }).catch(() => {
      resolve(null);
    });
  });
};

export const AuthenticationProvider = (props: { children: ReactNode }) => {
  const [state, setState] = useState<AuthenticationState>({ tag: "loading" });

  useEffect(() => {
    const currentToken = localStorage.getItem(tokenStorageKey) as SecureToken | null;

    const logout = async () => {
      localStorage.clear();
      setState({ tag: "unauthenticated", login });
    };

    const login: (loginDetails: LoginDetails) => Promise<boolean> = async (loginDetails) => {
      return new Promise((resolve) => {
        api().post("/authorise", loginDetails)
          .then(resp => {
            const { secureToken } = resp.data;

            if (secureToken) {
              localStorage.setItem(tokenStorageKey, secureToken);
              setState({ tag: "authenticated", secureToken, logout });
              resolve(true);
            } else {
              resolve(false);
            }
          }).catch(() => {
            resolve(false);
          });
      });
    };

    verifySecureToken(currentToken).then(verifiedToken => {
      if (verifiedToken) {
        localStorage.setItem(tokenStorageKey, verifiedToken);
        setState({ tag: "authenticated", secureToken: verifiedToken, logout });
      } else {
        setState({ tag: "unauthenticated", login });
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
