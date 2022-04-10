/* eslint-disable @typescript-eslint/no-explicit-any */
// You should use this when you either:
// - Have a type that you can't figure out, but maybe someone could help in a review
// - Have a type that you expect to get for free when some other code is also converted to typescript (maybe you *should* do that conversion)
export type TODO = any;

// You should use this when you need to type-check code that we plan on removing
// e.g. the `state` type in a `mapState` when using redux
export type WontFix = any;

/**
 * Graphql ID's are opaque strings, we would use `NewType` here, but the generated types wouldn't line up.
 * This is still useful to differentiate between places which are expecting a "UUID"
 */
export type ID = string;

export type GraphQLEntity = {
  __typename: string;
};

/**
 * In Typescript, due to its structural typing whenever you create an alias,
 * anything that matches that shape is assignable to that variable e.g.
 *
 * ```
 * type Minutes = number
 * let countdown: Minutes = 10
 * let daysToChristmas: number = 84
 * countdown = daysToChristmas // This is fine
 * ```
 *
 * NewType creates an alias that has its own identity
 *
 * ```
 * type Email = NewType<string>
 * let contact: Email = 'mail@example.com' as Email
 * let phoneNumber: string = '15'
 * contact = phoneNumber // @ts-expect-error
 * ```
 */
export type NewType<T> = T & { readonly __tag: unique symbol };

export type ISO8601DateTime = string;

/**
 * Like ISO8601DateTime but without the time component
 */
export type ISO8601Date = string;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ValuesOf<T extends {}> = T[keyof T];

export type UUID = NewType<string>;

export type Order = "asc" | "desc";

export type primitive = boolean | number | null | string | symbol | undefined;

export type DeepReadonly<T> = T extends primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : { readonly [P in keyof T]: DeepReadonly<T[P]> };

export type NonNull<T> = T extends primitive
  ? NonNullable<T>
  : T extends Array<infer U>
  ? Array<NonNull<U>>
  : { [P in keyof T]-?: NonNull<T[P]> };

export type DeepNonNull<T> = T extends primitive
  ? NonNullable<T>
  : T extends Array<infer U>
  ? Array<DeepNonNull<U>>
  : { readonly [P in keyof T]-?: DeepNonNull<T[P]> };

type JsonPrimitive = number | null | string | boolean;
type JsonObject = { [key: string]: Json };
type JsonArray = Array<Json>;

export type Json = JsonObject | JsonArray | JsonPrimitive;

// TODO: can the type force formatting? "YYYY-MM-DD"
export type DateString = string;
export type SecureToken = NewType<string>;
