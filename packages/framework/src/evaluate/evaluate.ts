import { isEmpty, merge, toString } from "lodash-es";
import { parse as acornParse } from "acorn";
import type { ScreenContextDefinition } from "../state/screen";
import type { InvokableMethods, WidgetState } from "../state/widget";
import {
  sanitizeJs,
  debug,
  visitExpressions,
  type EnsembleScreenModel,
  replace,
} from "../shared";

/**
 * Cache of compiled global / imported scripts keyed by the full script string.
 * Each entry stores the symbol names and their corresponding values so that we
 * can inject them as parameters when evaluating bindings, removing the need to
 * re-parse the same script for every binding.
 */
interface CachedScriptEntry {
  symbols: string[];
  // compiled function that, given a context, returns an object of exports
  fn: (ctx: { [key: string]: unknown }) => { [key: string]: unknown };
}

const globalScriptCache = new Map<string, CachedScriptEntry>();

const parseScriptSymbols = (script: string): string[] => {
  const symbols = new Set<string>();
  try {
    const ast: any = acornParse(script, {
      ecmaVersion: 2020,
      sourceType: "script",
    });

    ast.body?.forEach((node: any) => {
      if (node.type === "FunctionDeclaration" && node.id) {
        symbols.add(node.id.name);
      }
      if (node.type === "VariableDeclaration") {
        node.declarations.forEach((decl: any) => {
          if (decl.id?.type === "Identifier") {
            symbols.add(decl.id.name);
          }
        });
      }
    });
  } catch (e) {
    debug(e);
  }
  return Array.from(symbols);
};

const getCachedGlobals = (
  script: string,
  ctx: { [key: string]: unknown },
): { symbols: string[]; values: unknown[] } => {
  if (isEmpty(script.trim())) return { symbols: [], values: [] };

  let entry = globalScriptCache.get(script);
  if (!entry) {
    const symbols = parseScriptSymbols(script);

    // build a function that executes the script within the provided context using `with`
    // and returns an object containing the exported symbols
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const compiled = new Function(
      "ctx",
      `with (ctx) {\n${script}\nreturn { ${symbols.join(", ")} };\n}`,
    ) as CachedScriptEntry["fn"];

    entry = { symbols, fn: compiled };
    globalScriptCache.set(script, entry);
  }

  const exportsObj = entry.fn(ctx);
  const values = entry.symbols.map((name) => exportsObj[name]);
  return { symbols: entry.symbols, values };
};

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
  const globalBlock = screen.model?.global ?? "";
  const importedScriptBlock = screen.model?.importedScripts ?? "";
  const combinedScript = `${importedScriptBlock}\n${globalBlock}`;

  const { symbols: globalSymbols, values: globalValues } = getCachedGlobals(
    combinedScript,
    merge({}, context, invokableObj),
  );

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(
    ...Object.keys(invokableObj),
    ...globalSymbols,
    formatJs(js),
  );

  return () => jsFunc(...Object.values(invokableObj), ...globalValues);
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
    if (sanitizedJs.includes("await ")) {
      return `
        return (async function() {
          ${sanitizedJs}
        }())
      `;
    }

    return `
        return (function() {
          ${sanitizedJs}
        }())
      `;
  }

  if (sanitizedJs.includes("await ")) {
    return `
        return (async function() {
          return ${sanitizedJs}
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
