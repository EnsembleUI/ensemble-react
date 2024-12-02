import { isEmpty, merge, toString } from "lodash-es";
import type { ScreenContextDefinition } from "../state/screen";
import type { InvokableMethods, WidgetState } from "../state/widget";
import {
  sanitizeJs,
  debug,
  visitExpressions,
  type EnsembleScreenModel,
  replace,
} from "../shared";

export const widgetStatesToInvokables = (widgets: {
  [key: string]: WidgetState | undefined;
}): [string, InvokableMethods | undefined][] => {
  return Object.entries(widgets).map(([id, state]) => {
    const methods = state?.invokable?.methods;
    const values = state?.values;
    return [id, merge({}, values, methods)];
  });
};

export const buildEvaluateFn = (
  screen: Partial<ScreenContextDefinition>,
  js?: string,
  context?: { [key: string]: unknown },
): (() => unknown) => {
  const widgets: [string, InvokableMethods | undefined][] = screen.widgets
    ? widgetStatesToInvokables(screen.widgets)
    : [];

  const invokableObj = Object.fromEntries(
    [
      ...widgets,
      ...Object.entries(screen.inputs ?? {}),
      ...Object.entries(screen.data ?? {}),
      ...Object.entries(screen),
      ...Object.entries(context ?? {}),
      // Need to filter out invalid JS identifiers
    ].filter(([key, _]) => !key.includes(".")),
  );
  const globalBlock = screen.model?.global;
  const importedScriptBlock = screen.model?.importedScripts;

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(
    ...Object.keys(invokableObj),
    addScriptBlock(formatJs(js), globalBlock, importedScriptBlock),
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

const addScriptBlock = (
  js: string,
  globalBlock?: string,
  importedScriptBlock?: string,
): string => {
  let jsString = ``;

  if (importedScriptBlock) {
    jsString += `${importedScriptBlock}\n\n`;
  }

  if (globalBlock) {
    jsString += `${globalBlock}\n\n`;
  }

  return (jsString += `${js}`);
};

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
  context?: { [key: string]: unknown },
): T => {
  try {
    return buildEvaluateFn(screen, js, context)() as T;
  } catch (e) {
    debug(e);
    throw e;
  }
};

export const evaluateDeep = (
  inputs: { [key: string]: unknown },
  model?: EnsembleScreenModel,
  context?: { [key: string]: unknown },
): { [key: string]: unknown } => {
  const resolvedInputs = visitExpressions(
    inputs,
    replace((expr) => evaluate({ model }, expr, context)),
  );
  return resolvedInputs as { [key: string]: unknown };
};
