import { parseExpressionAt, tokTypes } from "acorn";
import type { Atom } from "jotai";
import { atom } from "jotai";
import { isNil, merge, omitBy } from "lodash-es";
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
  screenDataAtom,
  screenInputAtom,
  widgetFamilyAtom,
  screenGlobalScriptAtom,
  screenImportScriptAtom,
  userAtom,
  appAtom,
  secretAtom,
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
    // TODO: Account for data bindings also
    const dependencyAtom = widgetFamilyAtom(identifier);
    return { name: identifier, dependencyAtom };
  });

  const bindingAtom = atom((get) => {
    const data = get(screenDataAtom);
    const appData = get(appAtom);
    const valueEntries = dependencyEntries.map(({ name, dependencyAtom }) => {
      const value = get(dependencyAtom);
      debug(
        `value for dependency ${name} at ${String(widgetId)}: ${JSON.stringify(
          value,
        )}`,
      );
      return [name, value];
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
        widgets: omitBy(Object.fromEntries(valueEntries), isNil),
        data,
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
      const result = evaluate<T>(
        merge({}, defaultScreenContext, {
          model: {
            global: get(screenGlobalScriptAtom),
            importedScripts: get(screenImportScriptAtom),
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
