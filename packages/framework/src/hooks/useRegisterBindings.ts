import type { RefCallback } from "react";
import { useEffect, useMemo } from "react";
import { compact, isEmpty, merge, set } from "lodash-es";
import isEqual from "react-fast-compare";
import { atom, useAtom } from "jotai";
import type { InvokableMethods } from "../state";
import { createBindingAtom } from "../state";
import { type Expression, findExpressions } from "../shared";
import { useWidgetId } from "./useWidgetId";
import { useCustomScope } from "./useCustomScope";
import { useWidgetState } from "./useWidgetState";
import { useStyleNames } from "./useStyleNames";

export interface RegisterBindingsResult<T> {
  id: string;
  values?: T;
  rootRef: RefCallback<never>;
}

interface Bindings {
  [key: string]: unknown;
  styles?: {
    names?: Expression<string | string[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export const useRegisterBindings = <T extends Bindings>(
  values: T,
  id?: string,
  methods?: InvokableMethods,
): RegisterBindingsResult<T> => {
  const { resolvedWidgetId, rootRef } = useWidgetId(id);
  const [widgetState, setWidgetState] = useWidgetState<T>(resolvedWidgetId);
  const themeContext = useStyleNames(values?.styles?.names);

  const styles = merge({}, themeContext, values?.styles);
  merge(
    values,
    !isEmpty(styles) && {
      ...values,
      styles,
    },
  );
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
    // Improves performance greatly: o need to store state in global if there's no explicit ID to reference it with
    if (isEmpty(id)) {
      return;
    }

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
    id,
  ]);

  return {
    id: resolvedWidgetId,
    values: widgetState?.values ?? newValues,
    rootRef,
  };
};
