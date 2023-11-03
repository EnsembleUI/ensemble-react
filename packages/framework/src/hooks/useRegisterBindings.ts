import { useEffect, useMemo } from "react";
import { compact, isEqual, map, merge, throttle } from "lodash-es";
import { useAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import type { InvokableMethods, ScreenContextDefinition } from "../state";
import { screenAtom } from "../state";
import { evaluate } from "../evaluate";
import { isExpression } from "../shared";
import { useWidgetId } from "./useWidgetId";
import { useCustomScope } from "./useCustomScope";
import { useWidgetState } from "./useWidgetState";

export interface EnsembleWidgetState<T> {
  id: string;
  values?: T;
}

export const useRegisterBindings = <T extends Record<string, unknown>>(
  values: T,
  id?: string,
  methods?: InvokableMethods
): EnsembleWidgetState<T> => {
  const resolvedWidgetId = useWidgetId(id);
  const [widgetState, setWidgetState] = useWidgetState<T>(resolvedWidgetId);

  const expressions = useMemo(
    () =>
      compact(
        map(Object.entries(values), ([key, value]) => {
          if (isExpression(value)) {
            return [key, value.slice(2, value.length - 1)];
          }
        })
      ),
    // FIXME: update expressions if props change without creating new atom
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const customScope = useCustomScope();

  const bindingsAtom = useMemo(
    () =>
      selectAtom(
        screenAtom,
        throttle((screenContext: ScreenContextDefinition) => {
          const bindingValues = Object.fromEntries(
            expressions.map(([key, expression]) => {
              return [key, evaluate(screenContext, expression, customScope)];
            })
          );
          return bindingValues;
        }, 350),
        isEqual
      ),
    [customScope, expressions]
  );

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
  };
};
