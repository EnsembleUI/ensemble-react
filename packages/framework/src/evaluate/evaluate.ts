import { isEmpty, merge, toString } from "lodash-es";
import type { ScreenContextDefinition } from "../state/screen";
import type { InvokableMethods } from "../state/widget";
import { sanitizeJs, debug } from "../shared";

export const buildEvaluateFn = (
  screen: Partial<ScreenContextDefinition>,
  js?: string,
  context?: Record<string, unknown>,
): (() => unknown) => {
  const widgets: [string, InvokableMethods | undefined][] = Object.entries(
    screen.widgets ?? {},
  ).map(([id, state]) => {
    const methods = state?.invokable.methods;
    const values = state?.values;
    return [id, merge({}, values, methods)];
  });

  const invokableObj = Object.fromEntries([
    ...widgets,
    ...Object.entries(screen.inputs ?? {}),
    ...Object.entries(screen.data ?? {}),
    ...Object.entries(context ?? {}),
  ]);
  const globalBlock = screen.model?.global;

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(
    ...Object.keys(invokableObj),
    addGlobalBlock(formatJs(js), globalBlock),
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return () => jsFunc(...Object.values(invokableObj));
};

const formatJs = (js?: string): string => {
  if (!js || isEmpty(js)) {
    if (process.env.NODE_ENV === "debug") {
      return "console.debug('No expression was given')";
    }
    return "";
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
    return `
      return (function() {
         ${sanitizedJs}
      }())
    `;
  }

  return `return ${sanitizedJs}`;
};

const addGlobalBlock = (js: string, globalBlock?: string): string =>
  globalBlock ? `${globalBlock}\n\n${js}` : js;

/**
 * @deprecated Consider using useEvaluate or createBinding which will
 * optimize creating the evaluation context
 *
 * @param screen-the current screen state
 * @param js- the javascript to evaluate
 * @param context- any additional context needed for the script
 * @returns the result of the evaluated expression/script
 */
export const evaluate = <T = unknown>(
  screen: Partial<ScreenContextDefinition>,
  js?: string,
  context?: Record<string, unknown>,
): T => {
  try {
    return buildEvaluateFn(screen, js, context)() as T;
  } catch (e) {
    debug(e);
    throw e;
  }
};
