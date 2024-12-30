import { cloneDeep, get, isObject, isString, set } from "lodash-es";

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
  let placeholderStartIndices = [],
    openBraceCount = 0,
    closeBraceCount = 0;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "{") {
      openBraceCount++;
    } else if (input[i] === "}") {
      closeBraceCount++;
    }

    if (input[i] === "$" && input[i + 1] === "{") {
      placeholderStartIndices.push(i);
    }

    if (
      openBraceCount !== 0 &&
      closeBraceCount !== 0 &&
      openBraceCount === closeBraceCount
    ) {
      openBraceCount = 0;
      closeBraceCount = 0;
      placeholders.push(input.slice(placeholderStartIndices[0], i + 1));
      placeholderStartIndices = [];
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

export const validateExpressions = (
  value: string,
): { isValid: boolean; expressions: string[] } => {
  const expressions: string[] = [];
  let currentExpr = "";
  let depth = 0;
  let i = 0;

  while (i < value.length) {
    if (value[i] === "$" && value[i + 1] === "{") {
      if (depth === 0) {
        currentExpr = "";
      }
      depth++;
      currentExpr += value.slice(i, i + 2);
      i += 2;
      continue;
    }

    if (depth > 0) {
      currentExpr += value[i];
      if (value[i] === "{") {
        depth++;
      } else if (value[i] === "}") {
        depth--;
        if (depth === 0) {
          expressions.push(currentExpr);
        }
      }
    }
    i++;
  }

  return {
    isValid: depth === 0 && expressions.length > 0,
    expressions,
  };
};

export const replace =
  (replacer: (expr: string) => string) =>
  (val: string): unknown => {
    const { expressions, isValid } = validateExpressions(val);
    if (isValid) {
      if (expressions.length === 1 && val === expressions[0]) {
        return replacer(expressions[0]);
      }

      let replacedValue = val;
      expressions.forEach((expr) => {
        replacedValue = replacedValue.replace(expr, replacer(expr));
      });
      return replacedValue;
    }
    return val;
  };

export const visitExpressions = (
  obj: unknown,
  replacer: (expr: string) => unknown,
): unknown => {
  let clonedObj = cloneDeep(obj);
  if (isObject(clonedObj)) {
    if (Array.isArray(clonedObj)) {
      // If obj is an array, recursively visit and replace elements
      for (let i = 0; i < clonedObj.length; i++) {
        clonedObj[i] = visitExpressions(clonedObj[i], replacer);
      }
    } else {
      // If obj is an object, recursively visit and replace values
      for (const key in clonedObj) {
        const result = visitExpressions(get(clonedObj, key), replacer);
        set(clonedObj, key, result);
      }
    }
  } else if (isString(obj)) {
    clonedObj = replacer(obj);
  }

  return clonedObj;
};
