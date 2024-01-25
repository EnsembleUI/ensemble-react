import { useMemo } from "react";
import { atom, useAtom } from "jotai";
import { compact, merge, set } from "lodash-es";
import { findExpressions } from "../shared";
import { createBindingAtom } from "../state";
import { useCustomScope } from "./useCustomScope";

export const useEvaluate = <T extends Record<string, unknown>>(
  values?: T,
  options?: {
    context?: unknown;
    debugId?: string;
  },
): T | undefined => {
  const customScope = useCustomScope();

  const expressions = useMemo(() => {
    const expressionMap: string[][] = [];
    findExpressions(values, [], expressionMap);
    return expressionMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bindingsAtom = useMemo(() => {
    const bindingsEntries = compact(
      expressions.map(([name, expr]) => {
        const valueAtom = createBindingAtom(
          expr,
          merge({}, customScope, options?.context),
          options?.debugId,
        );
        return { name, valueAtom };
      }),
    );
    return atom((getAtom) => {
      const valueEntries: [string, unknown][] = bindingsEntries.map(
        ({ name, valueAtom }) => {
          return [name, getAtom(valueAtom)];
        },
      );
      const result = {};
      valueEntries.forEach(([name, value]) => set(result, name, value));
      return result;
    });
  }, [expressions, customScope, options?.context, options?.debugId]);

  const [bindings] = useAtom(bindingsAtom);
  return bindings as T;
};
