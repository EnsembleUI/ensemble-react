import { isEmpty, isObjectLike, last, merge, toString } from "lodash-es";
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

  try {
    const obj: unknown = JSON.parse(js);

    if (isObjectLike(obj)) {
      const replaced = js.replace(/['"]\$\{([^}]*)\}['"]/g, "$1"); // replace "${...}" or '${...}' with ...

      return `return ${replaced}`;
    }
  } catch (e) {
    /* empty */
  }

  const sanitizedJs = sanitizeJs(toString(js));
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
    return buildEvaluateFn(screen, js, context)();
  } catch (e) {
    return null;
  }
};
