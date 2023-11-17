import { isString } from "lodash-es";

export type Expression<T> = string | T;

export const isExpression = (
  maybeExpression: Expression<unknown>,
): maybeExpression is string =>
  isString(maybeExpression) &&
  maybeExpression.startsWith("${") &&
  maybeExpression.endsWith("}");

export const sanitizeJs = (string: string): string => {
  if (string.startsWith("${") && string.endsWith("}")) {
    return string.substring(2, string.length - 1);
  }
  return string.trim();
};

export const debug = (value: unknown): void => {
  if (process.env.NODE_ENV === "debug") {
    // eslint-disable-next-line no-console
    console.debug(value);
  }
};

export const error = (value: unknown): void => {
  // eslint-disable-next-line no-console
  console.error(value);
};
