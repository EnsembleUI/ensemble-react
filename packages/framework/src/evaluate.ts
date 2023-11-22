import { isEmpty, last, merge, toString } from "lodash-es";
import type { InvokableMethods, ScreenContextDefinition } from "./state";
import { EnsembleStorage } from "./storage";
import { sanitizeJs, debug } from "./shared";

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
    ...Object.entries(screen.inputs ?? {}),
    ...Object.entries(screen.data),
    ...Object.entries(context ?? {}),
  ]);

  invokableObj.ensemble = {
    storage: EnsembleStorage,
  };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(...[...Object.keys(invokableObj)], formatJs(js));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
  return () => jsFunc(...Object.values(invokableObj));
};

const formatJs = (js?: string): string => {
  if (!js || isEmpty(js)) {
    return "console.log('No expression was given')";
  }

  const sanitizedJs = sanitizeJs(toString(js));

  // js object
  if (
    (sanitizedJs.startsWith("{") && sanitizedJs.endsWith("}")) ||
    (sanitizedJs.startsWith("[") && sanitizedJs.endsWith("]"))
  )
    return `return ${js}`;

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

export const evaluate = (
  screen: ScreenContextDefinition,
  js?: string,
  context?: Record<string, unknown>,
): unknown => {
  try {
    return buildEvaluateFn(screen, js, context)();
  } catch (e) {
    debug(e);
    throw e;
  }
};
