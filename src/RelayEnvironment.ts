import { Environment, Network, RecordSource, Store } from "relay-runtime";
import { Json } from "./Types";
import { secrets } from "./secrets";
import { NewType } from "./Types";

export type JWT = NewType<string>;

const sendRequest =
  (token: JWT, onNoAuth: () => void) =>
  async (params: { name: string; text?: string | null }, variables: Json) => {
    const response = await fetch(secrets.graphUrl, {
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
      onNoAuth();
      return json;
    } else if (!response.ok) {
      throw new Error(body);
    }
    return json;
  };

export default new Environment({
  network: Network.create(sendRequest(secrets.authToken as JWT, () => {})),
  store: new Store(new RecordSource()),
});
