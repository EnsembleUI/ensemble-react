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

export const isMultipleExpressions = (input: string): boolean => {
  const placeholders = [];
  let stack = 0,
    start = -1;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "$" && input[i + 1] === "{") {
      if (stack === 0) start = i;
      stack++;
      i++;
    } else if (input[i] === "}") {
      stack--;
      if (stack === 0 && start !== -1) {
        placeholders.push(input.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return (
    placeholders.length > 1 ||
    (placeholders.length === 1 &&
      input.replace(placeholders[0], "").trim().length > 0)
  );
};

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
        isMultipleExpressions(value) ? `\${\`${value || ""}\`}` : value,
      ]);
    } else if (isObject(value)) {
      findExpressions(value, curPath, expressionMap);
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
