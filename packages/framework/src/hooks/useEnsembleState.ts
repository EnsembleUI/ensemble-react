import { useEffect } from "react";
import { compact, get, head, map, merge } from "lodash-es";
import type { InvokableMethods } from "../state";
import { useEnsembleStore } from "../state";
import { useWidgetId } from "./useWidgetId";
import { useCustomScope } from "./useCustomScope";

export interface EnsembleWidgetState<T> {
  id: string;
  values: T;
}

export const useEnsembleState = <T extends Record<string, unknown>>(
  values: T,
  id?: string,
  methods?: InvokableMethods,
): EnsembleWidgetState<T> => {
  const resolvedWidgetId = useWidgetId(id);

  const expressions = compact(
    map(Object.entries(values), ([key, value]) => {
      if (
        typeof value === "string" &&
        value.startsWith("${") &&
        value.endsWith("}")
      ) {
        return [key, value.slice(2, value.length - 1)];
      }
    }),
  );

  const { state, setWidget, ...screenValues } = useEnsembleStore((store) => ({
    state: store.screen.widgets[resolvedWidgetId],
    setWidget: store.screen.setWidget,
    ...Object.fromEntries(
      expressions.map(([key, expression]) => {
        const tokens = expression.split(".");
        const identifier = head(tokens);
        if (identifier === "data") {
          return [key, get(store.screen, tokens)];
        }
        tokens.splice(1, 0, "values");
        return [key, get(store.screen.widgets, tokens)];
      }),
    ),
  }));

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

  useEffect(() => {
    setWidget(resolvedWidgetId, {
      values,
      invokable: { id: resolvedWidgetId, methods },
    });
  }, [values, methods, resolvedWidgetId, setWidget]);

  return {
    id: resolvedWidgetId,
    values: merge({}, state?.values, bindings) as T,
  };
};
