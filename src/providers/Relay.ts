import { Environment, Network, RecordSource, Store } from "relay-runtime";
import { Json, SecureToken } from "../Types";
import { random } from "lodash";
import { config } from "../config";

const delay = (durationMilliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), durationMilliseconds);
  });
};

const sendRequest =
  (token: SecureToken, onNoAuth?: () => void) =>
  async (params: { name: string; text?: string | null }, variables: Json) => {
    if (process.env.NODE_ENV === "development") {
      await delay(random(200, 1000));
    }

    const response = await fetch(`${config.apiBaseUrl}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: params.text,
        variables,
      }),
    });

    const body = await response.text();
    const json = JSON.parse(body);

    if (
      response.status === 403 ||
      (response.status === 401 &&
        JSON.parse(body)?.error?.startsWith("Invalid authorization"))
    ) {
      onNoAuth?.();
      return json;
    } else if (!response.ok) {
      throw new Error(body);
    }
    return json;
  };

export const createRelayEnvironment = (token: SecureToken) => {
  return new Environment({
    network: Network.create(sendRequest(token)),
    store: new Store(new RecordSource()),
  });
};
