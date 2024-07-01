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

export const isTranslationKey = (
  maybeExpression: Expression<unknown>,
): maybeExpression is string =>
  isString(maybeExpression) && maybeExpression.startsWith("r@");

export const isHexCode = (
  maybeExpression: Expression<unknown>,
): maybeExpression is string =>
  isString(maybeExpression) && /^0x[0-9A-Fa-f]{8}$/.test(maybeExpression);

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

export const findHexCodes = (
  obj?: object,
  path: string[] = [],
  hexCodesMaps: string[][] = [],
): void => {
  if (!obj) {
    return;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const curPath = path.concat(key);
    if (isHexCode(value)) {
      hexCodesMaps.push([curPath.join("."), convertColor(value)]);
    } else if (isObject(value)) {
      findHexCodes(value, curPath, hexCodesMaps);
    }
  });
};

export const convertColor = (hex: string): string => {
  const hexValue = hex.slice(2); // Remove "0x"

  const alphaDec = parseInt(hexValue.slice(0, 2), 16) / 255;
  const redDec = parseInt(hexValue.slice(2, 4), 16);
  const greenDec = parseInt(hexValue.slice(4, 6), 16);
  const blueDec = parseInt(hexValue.slice(6, 8), 16);

  // RGBA format
  return `rgba(${redDec}, ${greenDec}, ${blueDec}, ${alphaDec.toFixed(2)})`;
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
