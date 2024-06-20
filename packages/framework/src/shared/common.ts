import { isObject, isString } from "lodash-es";

export type Expression<T> = string | T;

export const isExpression = (
  maybeExpression: Expression<unknown>,
): maybeExpression is string =>
  isString(maybeExpression) &&
  maybeExpression.startsWith("${") &&
  maybeExpression.endsWith("}");

export const isTranslationKey = (
  maybeExpression: Expression<unknown>,
): maybeExpression is string =>
  isString(maybeExpression) && maybeExpression.startsWith("r@");

export const sanitizeJs = (string: string): string => {
  const trimmedString = string.trim();
  if (trimmedString.startsWith("${") && trimmedString.endsWith("}")) {
    return trimmedString.substring(2, trimmedString.length - 1);
  }
  return trimmedString;
};

export const findExpressions = (
  obj?: object,
  path: string[] = [],
  expressionMap: string[][] = [],
): void => {
  if (!obj) {
    return;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const curPath = path.concat(key);
    if (isExpression(value)) {
      expressionMap.push([curPath.join("."), value]);
    } else if (isObject(value)) {
      findExpressions(value, curPath, expressionMap);
    }
  });
};

export const findTranslationKeys = (
  obj?: object,
  path: string[] = [],
  translationMap: string[][] = [],
): void => {
  if (!obj) {
    return;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const curPath = path.concat(key);
    if (isTranslationKey(value)) {
      translationMap.push([curPath.join("."), value.replace("r@", "")]);
    } else if (isObject(value)) {
      findTranslationKeys(value, curPath, translationMap);
    }
  });
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
