import { isEmpty, last, merge } from "lodash-es";
import type { ScreenContextDefinition } from "./state/screen";
import type { InvokableMethods } from "./state/widget";
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
  const globalBlock = screen.model?.global;
  invokableObj.ensemble = {
    storage: EnsembleStorage,
  };
  const mergedJs = `${globalBlock}\n\n${js ?? ""}`;
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(
    ...[...Object.keys(invokableObj)],
    formatJs(mergedJs),
  );
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

export const evaluate = (
  screen: ScreenContextDefinition,
  js?: string,
  context?: Record<string, unknown>,
): unknown => {
  try {
    const fn = buildEvaluateFn(screen, js, context);
    return fn();
  } catch (e) {
    debug(e);
    throw e;
  }
};
