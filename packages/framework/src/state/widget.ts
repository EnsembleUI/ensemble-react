import { parseExpressionAt, tokTypes } from "acorn";
import { focusAtom } from "jotai-optics";
import type { Atom } from "jotai";
import { atom, useAtomValue } from "jotai";
import { isNil, mapKeys, merge, omitBy } from "lodash-es";
import { atomFamily } from "jotai/utils";
import type {
  Expression,
  EnsembleWidgetModel,
  EnsembleAPIModel,
} from "../shared";
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
import { themeAtom, envAtom } from "./application";
import type { EnsembleUser } from "./user";
import { userAtom } from "./user";

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
): Atom<T | undefined | null> => {
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
    let user: EnsembleUser | undefined;
    let env: Record<string, unknown> | undefined;
    if (rawJsExpression.includes("ensemble.storage")) {
      storage = get(screenStorageAtom);
    }
    if (rawJsExpression.includes("ensemble.user")) {
      user = get(userAtom);
    }
    if (rawJsExpression.includes("ensemble.env")) {
      env = get(envAtom);
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
          user,
          env,
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
      return null;
    }
  });

  return bindingAtom;
};

export interface WidgetContextDefinition {
  model?: EnsembleWidgetModel;
}

export const defaultWidgetContext = {
  model: undefined,
};

export const widgetAtom = atom<WidgetContextDefinition>(defaultWidgetContext);

export const widgetApiAtom = focusAtom(widgetAtom, (optic) => {
  return optic.prop("model").optional().prop("apis");
});

export const useWidgetData = (): { apis?: EnsembleAPIModel[] } => {
  const apis = useAtomValue(widgetApiAtom);

  return {
    apis,
  };
};

const DOT_CHARCODE = 46; // .
