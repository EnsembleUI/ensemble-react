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

interface ScriptOptions extends Partial<HTMLScriptElement> {
  id?: string;
}

export const DOMManager = (function DOMManagerFactory(): {
  addScript: (
    src: string,
    options?: ScriptOptions,
  ) => Promise<HTMLScriptElement>;
  clearAllScripts: () => void;
} {
  const allScripts = new Set<HTMLScriptElement>();

  return {
    /**
     * Adds a script element to the document
     * @param src - Source URL of the script
     * @param options - Optional configuration for the script element
     * @returns Promise that resolves with the script element
     */
    addScript: function addScript(js: string): Promise<HTMLScriptElement> {
      const script = document.createElement("script");

      script.type = "text/javascript";
      script.textContent = js;

      allScripts.add(script);

      return new Promise((resolve, reject) => {
        script.onload = (): void => resolve(script);
        script.onerror = (): void => reject(new Error(`Failed to load script`));
        document.body.appendChild(script);
      });
    },

    // Clear all managed scripts
    clearAllScripts: function clearAllScripts(): void {
      allScripts.forEach((script) => script.remove());
    },
  };
})();

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

  const combinedJs = `
    return myScreenScope(
      () => {
        return (${Object.keys(invokableObj).join(",")}) => {
          ${formatJs(js)}
        };
      },
      ...Object.keys(invokableObj) // Pass the entire context object
    )(${Object.keys(invokableObj)
      .map((key) => key)
      .join(",")});
  `;

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(...Object.keys(invokableObj), combinedJs);

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

  if (
    (sanitizedJs.startsWith("{") && sanitizedJs.endsWith("}")) ||
    (sanitizedJs.startsWith("[") && sanitizedJs.endsWith("]"))
  ) {
    return `return ${sanitizedJs}`;
  }

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
