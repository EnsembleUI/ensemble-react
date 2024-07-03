import { isObject, isString } from "lodash-es";

export type Expression<T> = string | T;

export const isExpression = (
  maybeExpression: Expression<unknown>,
): maybeExpression is string => {
  if (!isString(maybeExpression)) {
    return false;
  }

  const regex = /\$\{[^}]+\}/g;
  return regex.test(maybeExpression);
};

export const isCompoundExpression = (input: string): boolean => {
  const placeholders = [];
  let start = [],
    sc = 0,
    ec = 0;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "{") {
      sc++;
    } else if (input[i] === "}") {
      ec++;
    }

    if (input[i] === "$" && input[i + 1] === "{") {
      start.push(i);
    }

    if (sc !== 0 && ec !== 0 && sc === ec) {
      sc = 0;
      ec = 0;
      placeholders.push(input.slice(start[0], i + 1));
      start = [];
    }
  }

  if (placeholders.length === 0) {
    return false; // No placeholders, not a compound expression
  }

  if (placeholders.length > 1) {
    return true; // Multiple placeholders, compound expression
  }

  // Single placeholder
  const placeholder = placeholders[0];
  const remainingString = input.replace(placeholder, "").trim();

  // Check if there is text around the placeholder
  return remainingString.length > 0;
};

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
      expressionMap.push([
        curPath.join("."),
        isCompoundExpression(value) ? `\${\`${value || ""}\`}` : value,
      ]);
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
