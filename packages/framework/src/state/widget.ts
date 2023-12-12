import { parseExpressionAt, tokTypes } from "acorn";
import { focusAtom } from "jotai-optics";
import type { Atom } from "jotai";
import { atom } from "jotai";
import { isNil, mapKeys, merge, omitBy } from "lodash-es";
import { atomFamily } from "jotai/utils";
import type { Expression } from "../shared";
import { isExpression, sanitizeJs, debug, error } from "../shared";
import { evaluate } from "../evaluate";
import {
  createStorageApi,
  screenStorageAtom,
} from "../hooks/useEnsembleStorage";
import {
  defaultScreenContext,
  screenAtom,
  screenDataAtom,
  screenInputAtom,
} from "./screen";
import { themeAtom } from "./application";

export interface WidgetState<T = Record<string, unknown>> {
  values: T;
  invokable: Invokable;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export type InvokableMethods = Record<string, Function>;
export interface Invokable {
  id: string;
  methods?: InvokableMethods;
}

export const widgetFamilyAtom = atomFamily((id: string) =>
  focusAtom(screenAtom, (optics) => optics.path("widgets", id)),
);

export const createBindingAtom = <T = unknown>(
  expression?: Expression<unknown>,
  context?: Record<string, unknown>,
  widgetId?: string,
): Atom<T | undefined> => {
  if (!isExpression(expression)) {
    return atom(undefined);
  }

  const rawJsExpression = sanitizeJs(expression);
  const identifiers: string[] = [];

  try {
    parseExpressionAt(rawJsExpression, 0, {
      ecmaVersion: 6,
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
    const inputs = get(screenInputAtom);
    const theme = get(themeAtom);
    let storage: Record<string, unknown> | undefined;
    if (rawJsExpression.includes("ensemble.storage")) {
      storage = get(screenStorageAtom);
    }
    const valueEntries = dependencyEntries.map(({ name, dependencyAtom }) => {
      const value = get(dependencyAtom);
      debug(
        `value for dependency ${name} at ${String(widgetId)}: ${JSON.stringify(
          value,
        )}`,
      );
      return [name, value?.values];
    });
    const evaluationContext = merge(
      inputs,
      omitBy(Object.fromEntries(valueEntries), isNil),
      mapKeys(theme?.Tokens ?? {}, (_, key) => key.toLowerCase()),
      { styles: theme?.Styles },
      context,
      {
        ensemble: {
          storage: createStorageApi(storage),
        },
      },
    ) as Record<string, unknown>;
    try {
      const result = evaluate<T>(
        { ...defaultScreenContext, data },
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
      return undefined;
    }
  });

  return bindingAtom;
};

const DOT_CHARCODE = 46; // .
