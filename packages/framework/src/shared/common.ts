import { isString } from "lodash-es";

export type Expression<T> = string | T;

export type TemplateData = object | unknown[];

export const isExpression = (
  maybeExpression: Expression<unknown>,
): maybeExpression is string =>
  isString(maybeExpression) &&
  maybeExpression.startsWith("${") &&
  maybeExpression.endsWith("}");
