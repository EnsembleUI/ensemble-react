import { parseExpressionAt, tokTypes } from "acorn";
import type { Atom } from "jotai";
import { atom } from "jotai";
import { groupBy, has, isNil, merge, omitBy } from "lodash-es";
import type { Expression } from "../shared";
import { isExpression, sanitizeJs, debug, error } from "../shared";
import {
  createStorageApi,
  screenStorageAtom,
} from "../hooks/useEnsembleStorage";
import { DateFormatter } from "../date/dateFormatter";
import {
  themeAtom,
  envAtom,
  defaultScreenContext,
  screenInputAtom,
  widgetFamilyAtom,
  screenGlobalScriptAtom,
  screenImportScriptAtom,
  userAtom,
  appAtom,
  secretAtom,
  screenDataFamilyAtom,
  menuImportScriptAtom,
} from "../state";
import { deviceAtom } from "../hooks/useDeviceObserver";
import { evaluate } from "./evaluate";
import { createEvaluationContext } from "./context";

export const createBindingAtom = <T = unknown>(
  expression?: Expression<unknown>,
  context?: { [key: string]: unknown },
  widgetId?: string,
): Atom<T | undefined | null> => {
  if (!isExpression(expression)) {
    return atom(undefined);
  }

  const rawJsExpression = sanitizeJs(expression);
  const identifiers: string[] = [];

  try {
    parseExpressionAt(rawJsExpression, 0, {
      ecmaVersion: 2020,
      onToken: (token) => {
        if (token.type !== tokTypes.name) {
          return;
        }

        const name = rawJsExpression.substring(token.start, token.end);
        const isPrecededByDot =
          rawJsExpression.charCodeAt(token.start - 1) === DOT_CHARCODE;
        const isDeclaredInContext = context && name in context;
        if (!isPrecededByDot && !isDeclaredInContext) {
          identifiers.push(name);
        }
      },
    });
  } catch (e) {
    error(e);
    return atom(undefined);
  }

  const dependencyEntries = identifiers.map((identifier) => {
    debug(`found dependency for ${String(widgetId)}: ${identifier}`);
    const widgetDepAtom = widgetFamilyAtom(identifier);
    const dataDepAtom = screenDataFamilyAtom(identifier);
    // TODO: find a better way to distinguish data and widget identifiers
    return { name: identifier, dependencies: [dataDepAtom, widgetDepAtom] };
  });

  const bindingAtom = atom((get) => {
    const appData = get(appAtom);
    const valueEntries = dependencyEntries.map(({ name, dependencies }) => {
      let value;
      for (const depAtom of dependencies) {
        const depValue = get<unknown>(depAtom);
        if (depValue) {
          value = depValue;
          break;
        }
      }
      debug(
        `value for dependency ${name} at ${String(widgetId)}: ${JSON.stringify(
          value,
        )}`,
      );
      return [name, value];
    });

    const values = groupBy(valueEntries, ([, value]) => {
      // is widget state
      if (has(value, "values") || has(value, "invokables")) {
        return "widgets";
      }
      return "data";
    });

    const evaluationContext = createEvaluationContext({
      applicationContext: {
        application: {
          languages: appData.application?.languages,
          themes: appData.application?.themes,
        },
        selectedTheme: get(themeAtom),
        env: get(envAtom),
        secrets: get(secretAtom),
      },
      screenContext: {
        inputs: get(screenInputAtom),
        widgets: omitBy(Object.fromEntries(values.widgets ?? []), isNil),
        data: omitBy(Object.fromEntries(values.data ?? []), isNil),
      },
      ensemble: {
        storage: createStorageApi(
          rawJsExpression.includes("ensemble.storage")
            ? get(screenStorageAtom)
            : undefined,
        ),
        user: rawJsExpression.includes("ensemble.user")
          ? get(userAtom)
          : undefined,
        env: rawJsExpression.includes("ensemble.env")
          ? get(envAtom)
          : undefined,
        secrets: rawJsExpression.includes("ensemble.secrets")
          ? get(secretAtom)
          : undefined,
        formatter: DateFormatter(),
      },
      context: {
        ...(rawJsExpression.includes("device")
          ? { device: get(deviceAtom) }
          : {}),
        ...context,
      },
    });

    try {
      const screenImportedScripts = get(screenImportScriptAtom);
      const menuImportedScripts = get(menuImportScriptAtom);
      // Prioritize menu scripts if available, otherwise use screen scripts.
      const effectiveImportedScripts =
        menuImportedScripts ?? screenImportedScripts;
      const result = evaluate<T>(
        merge({}, defaultScreenContext, {
          model: {
            global: get(screenGlobalScriptAtom),
            importedScripts: effectiveImportedScripts,
          },
        }),
        rawJsExpression,
        evaluationContext,
      );
      debug(
        `result for ${rawJsExpression} at ${String(widgetId)}: ${JSON.stringify(
          result,
        )}`,
      );
      return result;
    } catch (e) {
      debug(e);
      return null;
    }
  });

  return bindingAtom;
};

const DOT_CHARCODE = 46; // .
