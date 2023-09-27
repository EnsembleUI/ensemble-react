import { useEffect, useMemo } from "react";
import { compact, get, head, isEqual, map, merge } from "lodash-es";
import { useAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { InvokableMethods } from "../state";
import { screenAtom } from "../state";
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

  const bindingsAtom = useMemo(
    () =>
      selectAtom(
        screenAtom,
        (screenContext) => {
          const bindingValues = Object.fromEntries(
            expressions.map(([key, expression]) => {
              const tokens = expression.split(".");
              const identifier = head(tokens);
              if (identifier === "data") {
                return [key, get(screenContext, tokens)];
              }
              tokens.splice(1, 0, "values");
              return [key, get(screenContext.widgets, tokens)];
            }),
          );
          return bindingValues;
        },
        isEqual,
      ),
    [expressions],
  );

  const [screenValues] = useAtom(bindingsAtom);

  const customScope = useCustomScope();
  const customScopeValues = Object.fromEntries(
    compact(
      expressions.map(([key, expression]) => {
        const value = get(customScope, expression);
        if (value === undefined) {
          return;
        }
        return [key, value];
      }),
    ),
  );
  const bindings = {
    ...screenValues,
    ...customScopeValues,
  };

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
