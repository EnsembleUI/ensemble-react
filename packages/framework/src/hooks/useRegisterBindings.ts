import type { RefObject } from "react";
import { useEffect, useMemo } from "react";
import { compact, isEqual, map, merge } from "lodash-es";
import { atom, useAtom } from "jotai";
import type { InvokableMethods } from "../state";
import { createBindingAtom } from "../state";
import { isExpression } from "../shared";
import { useWidgetId } from "./useWidgetId";
import { useCustomScope } from "./useCustomScope";
import { useWidgetState } from "./useWidgetState";

export interface RegisterBindingsResult<T> {
  id: string;
  values?: T;
  rootRef: RefObject<never>;
}

export const useRegisterBindings = <T extends Record<string, unknown>>(
  values: T,
  id?: string,
  methods?: InvokableMethods,
): RegisterBindingsResult<T> => {
  const { resolvedWidgetId, rootRef } = useWidgetId(id);
  const [widgetState, setWidgetState] = useWidgetState<T>(resolvedWidgetId);

  const expressions = useMemo(
    () => {
      // console.log(`getting expressions for ${resolvedWidgetId}`);
      return compact(
        map(Object.entries(values), ([key, value]) => {
          if (isExpression(value)) {
            return [key, value];
          }
        }),
      );
    },
    // FIXME: update expressions if props change without creating new atom
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const customScope = useCustomScope();

  const bindingsAtom = useMemo(() => {
    // console.log(`creating binding for ${resolvedWidgetId}`);
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
      // console.log(`get bindings for ${resolvedWidgetId}`);
      const valueEntries = bindingsEntries.map(({ name, valueAtom }) => {
        return [name, get(valueAtom)];
      });
      return Object.fromEntries(valueEntries) as Record<string, unknown>;
    });
  }, [customScope, expressions]);

  // console.log(`render: ${resolvedWidgetId}`);
  const [bindings] = useAtom(bindingsAtom);

  const newValues = merge({}, values, bindings) as T;
  useEffect(() => {
    if (
      isEqual(newValues, widgetState?.values) &&
      isEqual(methods, widgetState?.invokable?.methods)
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
  ]);

  return {
    id: resolvedWidgetId,
    values: widgetState?.values,
    rootRef,
  };
};
