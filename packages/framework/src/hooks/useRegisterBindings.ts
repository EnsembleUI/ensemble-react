import type { RefCallback } from "react";
import { useEffect, useMemo } from "react";
import { compact, merge, set } from "lodash-es";
import isEqual from "react-fast-compare";
import { atom, useAtom } from "jotai";
import type { InvokableMethods } from "../state";
import { createBindingAtom } from "../state";
import { findExpressions } from "../shared";
import { useWidgetId } from "./useWidgetId";
import { useCustomScope } from "./useCustomScope";
import { useWidgetState } from "./useWidgetState";

export interface RegisterBindingsResult<T> {
  id: string;
  values?: T;
  rootRef: RefCallback<never>;
}

export const useRegisterBindings = <T extends Record<string, unknown>>(
  values: T,
  id?: string,
  methods?: InvokableMethods,
): RegisterBindingsResult<T> => {
  const { resolvedWidgetId, rootRef } = useWidgetId(id);
  const [widgetState, setWidgetState] = useWidgetState<T>(resolvedWidgetId);

  const expressions = useMemo(() => {
    const expressionMap: string[][] = [];
    findExpressions(values, [], expressionMap);
    return expressionMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customScope = useCustomScope();

  const bindingsAtom = useMemo(() => {
    const bindingsEntries = compact(
      expressions.map(([name, expr]) => {
        const valueAtom = createBindingAtom(
          expr,
          customScope,
          resolvedWidgetId,
        );
        if (!valueAtom) {
          return;
        }
        return { name, valueAtom };
      }),
    );
    return atom((get) => {
      const valueEntries: [string, unknown][] = bindingsEntries.map(
        ({ name, valueAtom }) => {
          return [name, get(valueAtom)];
        },
      );
      const result = {};
      valueEntries.forEach(([name, value]) => set(result, name, value));
      return result;
    });
  }, [customScope, expressions, resolvedWidgetId]);

  const [bindings] = useAtom(bindingsAtom);

  const newValues = merge({}, values, bindings) as T;
  useEffect(() => {
    if (
      isEqual(newValues, widgetState?.values) &&
      isEqual(methods, widgetState?.invokable.methods)
    ) {
      return;
    }

    setWidgetState({
      values: newValues,
      invokable: { id: resolvedWidgetId, methods },
    });
  }, [
    methods,
    resolvedWidgetId,
    setWidgetState,
    newValues,
    widgetState?.values,
    widgetState?.invokable.methods,
  ]);

  return {
    id: resolvedWidgetId,
    values: widgetState?.values,
    rootRef,
  };
};
