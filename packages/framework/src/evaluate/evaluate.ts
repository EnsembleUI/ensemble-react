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

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
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
/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */

const getCachedGlobals = (
  script: string,
  ctx: { [key: string]: unknown },
): { symbols: string[]; values: unknown[] } => {
  if (isEmpty(script.trim())) return { symbols: [], values: [] };

  let entry = globalScriptCache.get(script);
  const stats = getDevStats();

  if (entry) {
    if (stats) stats.cacheHits += 1;
  } else {
    if (stats) stats.cacheMisses += 1;

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

  // 1️⃣ cache/compile the IMPORT block (shared across screens)
  const importResult = getCachedGlobals(
    importedScriptBlock,
    merge({}, context, invokableObj),
  );

  // build an object of import exports so the global block can access them
  const importExportsObj = Object.fromEntries(
    importResult.symbols.map((s, i) => [s, importResult.values[i]]),
  );

  // 2️⃣ cache/compile the GLOBAL block (per screen) with import exports in scope
  const globalResult = getCachedGlobals(
    globalBlock,
    merge({}, context, invokableObj, importExportsObj),
  );

  // 3️⃣ merge symbols and values (global overrides import if duplicate)
  const symbolValueMap = new Map<string, unknown>();
  importResult.symbols.forEach((sym, idx) => {
    symbolValueMap.set(sym, importResult.values[idx]);
  });
  globalResult.symbols.forEach((sym, idx) => {
    symbolValueMap.set(sym, globalResult.values[idx]);
  });

  const allSymbols = Array.from(symbolValueMap.keys());
  const allValues = Array.from(symbolValueMap.values());

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const jsFunc = new Function(
    ...Object.keys(invokableObj),
    ...allSymbols,
    formatJs(js),
  );

  return () => {
    const stats = getDevStats();
    if (stats) stats.bindingsEvaluated += 1;
    return jsFunc(...Object.values(invokableObj), ...allValues) as unknown;
  };
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

export const testGetScriptCacheSize = (): number => globalScriptCache.size;

// -----------------------------------------------------------------------------
// Development-time instrumentation (optional)
// -----------------------------------------------------------------------------

interface EnsembleStats {
  cacheHits: number;
  cacheMisses: number;
  bindingsEvaluated: number;
}

/**
 * Access a singleton stats object that lives on globalThis so tests and the
 * dev console can inspect cache behaviour.
 * Only initialised when not in production mode to avoid polluting the global
 * scope in production bundles.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getDevStats = () => {
  if (process.env.NODE_ENV === "production") return undefined;

  const g = globalThis as typeof globalThis & {
    __ensembleStats?: EnsembleStats;
  };
  if (!g.__ensembleStats) {
    g.__ensembleStats = {
      cacheHits: 0,
      cacheMisses: 0,
      bindingsEvaluated: 0,
    };
  }
  return g.__ensembleStats;
};
