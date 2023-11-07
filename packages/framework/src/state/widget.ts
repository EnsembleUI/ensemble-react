import type { Token } from "acorn";
import { parseExpressionAt, tokTypes } from "acorn";
import { focusAtom } from "jotai-optics";
import type { Atom } from "jotai";
import { atom } from "jotai";
import { merge } from "lodash-es";
import type { Expression } from "../shared";
import { isExpression, sanitizeJs, debug } from "../shared";
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
  const nameTokens: Token[] = [];

  debug(`raw expression for ${String(widgetId)}: ${rawJsExpression}`);
  try {
    parseExpressionAt(rawJsExpression, 0, {
      ecmaVersion: 6,
      onToken: (token) => {
        if (token.type !== tokTypes.name) {
          return;
        }

        const isPrecededByDot =
          rawJsExpression.charCodeAt(token.start - 1) === DOT_CHARCODE;
        if (!isPrecededByDot) {
          nameTokens.push(token);
        }
      },
    });
  } catch (e) {
    debug(e);
    return;
  }

  const dependencyEntries = nameTokens.map((identifier) => {
    const name = rawJsExpression.substring(identifier.start, identifier.end);
    debug(`found dependency for ${String(widgetId)}: ${name}`);
    const dependencyAtom = focusAtom(screenAtom, (optic) =>
      optic.path("widgets", name),
    );
    return { name, dependencyAtom };
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
  });

  return bindingAtom;
};

const DOT_CHARCODE = 46; // .
