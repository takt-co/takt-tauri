type JsonPrimitive = number | null | string | boolean;
type JsonObject = { [key: string]: Json };
type JsonArray = Array<Json>;

export type Json = JsonObject | JsonArray | JsonPrimitive;
