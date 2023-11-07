import {
  compact,
  countBy,
  isArray,
  isEmpty,
  isString,
  last,
  merge,
  toLength,
  values,
} from "lodash-es";
import type { InvokableMethods, ScreenContextDefinition } from "./state";
import { EnsembleStorage } from "./storage";

export const buildEvaluateFn = (
  screen: ScreenContextDefinition,
  js?: string,
  context?: Record<string, unknown>,
): (() => unknown) => {
  const widgets: [string, InvokableMethods | undefined][] = Object.entries(
    screen.widgets,
  ).map(([id, state]) => {
    const methods = state?.invokable.methods;
    const values = state?.values;
    return [id, merge({}, values, methods)];
  });

  const invokableObj = Object.fromEntries([
    ...widgets,
    ...Object.entries(screen.data),
    ...Object.entries(context ?? {}),
  ]);

  invokableObj.ensemble = {
    storage: EnsembleStorage,
  };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(...[...Object.keys(invokableObj)], formatJs(js));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return () => jsFunc(...Object.values(invokableObj));
};

const formatJs = (js?: string): string => {
  if (!js || isEmpty(js)) {
    return "console.log('No expression was given')";
  }
  const sanitizedJs = sanitizeJs(js);
  // multiline js
  if (sanitizedJs.includes("\n")) {
    const lines = sanitizedJs.split("\n");
    const lastLine = last(lines);
    lines.splice(lines.length - 1, 1, `return ${String(lastLine)}`);
    return `
      return (function() {
        ${lines.join("\n")}
      }())
    `;
  }
  return `return ${sanitizedJs}`;
};

const sanitizeJs = (string: string): string => {
  if (string.startsWith("${") && string.endsWith("}")) {
    return string.substring(2, string.length - 1);
  }
  return string.trim();
};

export const evaluate = (
  screen: ScreenContextDefinition,
  js?: string,
  context?: Record<string, unknown>,
): unknown => {
  try {
    const expressions = countBy(compact(js?.split("${")), (i) =>
      i.startsWith("${"),
    );

    if (js === undefined || toLength(values(expressions)) <= 1)
      return buildEvaluateFn(screen, js, context)();
    else {
      let result = js;

      let searchIndex = 0;
      while (true) {
        const open = result.indexOf("${", searchIndex);
        if (open === -1) break;

        const close = result.indexOf("}", open);
        if (close === -1) break;

        const template = result.slice(open + 2, close);
        const value = buildEvaluateFn(screen, template, context)();

        let replaced = value;
        if (isArray(value)) replaced = `[${value}]`;
        else if (typeof value === "object") replaced = JSON.stringify(value);

        result = `${result.slice(
          0,
          open - (isArray(value) ? 1 : 0),
        )}${replaced}${result.slice(close + 1 + (isArray(value) ? 1 : 0))}`;

        searchIndex = open + toLength(value);
      }
      isString(result) && (result = JSON.parse(result));

      return result;
    }
  } catch (e) {
    return null;
  }
};
