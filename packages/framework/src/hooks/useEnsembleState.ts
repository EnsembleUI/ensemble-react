import { useEffect } from "react";
import type { InvokableMethods } from "../state";
import { useEnsembleStore } from "../state";
import { useWidgetId } from "./useWidgetId";

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
  const { bindings, setWidget } = useEnsembleStore((state) => ({
    bindings: state.screen.widgets[resolvedWidgetId],
    setWidget: state.screen.setWidget,
  }));

  useEffect(() => {
    setWidget(resolvedWidgetId, {
      values,
      invokable: { id: resolvedWidgetId, methods },
    });
  }, [values, methods, setWidget, resolvedWidgetId]);

  return {
    id: resolvedWidgetId,
    values: (bindings?.values ?? {}) as T,
  };
};
