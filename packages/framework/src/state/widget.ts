import { parseExpressionAt, tokTypes } from "acorn";
import { focusAtom } from "jotai-optics";
import type { Atom } from "jotai";
import { atom } from "jotai";
import { merge } from "lodash-es";
import type { Expression } from "../shared";
import { isExpression, sanitizeJs, debug, error } from "../shared";
import { evaluate } from "../evaluate";
import { defaultScreenContext, screenAtom } from "./screen";

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

export const createBindingAtom = (
  expression?: Expression<unknown>,
  context?: Record<string, unknown>,
  widgetId?: string,
): Atom<unknown> | undefined => {
  if (!isExpression(expression)) {
    return;
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
    return;
  }

  const dependencyEntries = identifiers.map((identifier) => {
    debug(`found dependency for ${String(widgetId)}: ${identifier}`);
    // TODO: Account for data bindings also
    const dependencyAtom = focusAtom(screenAtom, (optic) =>
      optic.path("widgets", identifier),
    );
    return { name: identifier, dependencyAtom };
  });

  const bindingAtom = atom((get) => {
    const valueEntries = dependencyEntries.map(({ name, dependencyAtom }) => {
      const value = get(dependencyAtom);
      debug(
        `value for dependency ${name} at ${String(widgetId)}: ${JSON.stringify(
          value,
        )}`,
      );
      return [name, value?.values];
    });
    // const screenContext = get(screenAtom);
    const evaluationContext = merge(
      Object.fromEntries(valueEntries),
      context,
    ) as Record<string, unknown>;
    try {
      const result = evaluate(
        defaultScreenContext,
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
    }
  });

  return bindingAtom;
};

const DOT_CHARCODE = 46; // .
