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
      expressionMap.push([curPath.join("."), combineExpressions(value)]);
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

export const combineExpressions = (input: string): string => {
  // Regular expression to split the input into literals and template variables
  // eslint-disable-next-line prefer-named-capture-group
  const parts = input.split(/(\$\{[^}]+\})/g).filter((x) => x);

  // Initialize an array to store the processed parts of the new string
  const resultParts: string[] = [];

  // Iterate over each part and process accordingly
  parts.forEach((part) => {
    if (part.startsWith("${") && part.endsWith("}")) {
      // If the part is a template variable, remove the delimiters and add to resultParts
      resultParts.push(part.slice(2, -1));
    } else if (part) {
      // If the part is a literal, wrap it in single quotes and add to resultParts
      resultParts.push(`'${part}'`);
    }
  });

  // Combine all parts with ' + ' and return the result
  return resultParts.length ? `\${${resultParts.join(" + ")}}` : input;
};
