import { useEffect, useMemo } from "react";
import { compact, isEqual, map, merge } from "lodash-es";
import { useAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { InvokableMethods } from "../state";
import { screenAtom } from "../state";
import { evaluate } from "../evaluate";
import { useWidgetId } from "./useWidgetId";
import { useCustomScope } from "./useCustomScope";

export interface EnsembleWidgetState<T> {
  id: string;
  values: T;
}

export const useRegisterBindings = <T extends Record<string, unknown>>(
  values: T,
  id?: string,
  methods?: InvokableMethods,
): EnsembleWidgetState<T> => {
  const resolvedWidgetId = useWidgetId(id);
  const widgetStateAtom = useMemo(
    () =>
      focusAtom(screenAtom, (optic) => optic.path("widgets", resolvedWidgetId)),
    [resolvedWidgetId],
  );

  const [widgetState, setWidgetState] = useAtom(widgetStateAtom);

  const expressions = useMemo(
    () =>
      compact(
        map(Object.entries(values), ([key, value]) => {
          if (
            typeof value === "string" &&
            value.startsWith("${") &&
            value.endsWith("}")
          ) {
            return [key, value.slice(2, value.length - 1)];
          }
        }),
      ),
    // FIXME: update expressions if props change without creating new atom
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const customScope = useCustomScope();

  const bindingsAtom = useMemo(
    () =>
      selectAtom(
        screenAtom,
        (screenContext) => {
          const bindingValues = Object.fromEntries(
            expressions.map(([key, expression]) => {
              return [key, evaluate(screenContext, expression, customScope)];
            }),
          );
          return bindingValues;
        },
        isEqual,
      ),
    [customScope, expressions],
  );

  const [bindings] = useAtom(bindingsAtom);

  const newValues = merge({}, values, bindings) as T;

  useEffect(() => {
    if (isEqual(newValues, widgetState?.values)) {
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
    values: newValues,
  };
};
