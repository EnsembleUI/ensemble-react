import { isString } from "lodash-es";

export type Expression<T> = string | T;

export type TemplateData = object | unknown[];

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
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(value);
  }
};
