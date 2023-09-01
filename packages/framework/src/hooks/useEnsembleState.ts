import { useEffect } from "react";
import type { Invokable } from "../state";
import { useEnsembleStore } from "../state";

export const useEnsembleState = <T extends Record<string, unknown>>(
  invokable: Invokable,
  values: T,
): T | null => {
  const { bindings, setWidget } = useEnsembleStore((state) => ({
    bindings: state.widgets[invokable.id],
    setWidget: state.setWidget,
  }));

  useEffect(() => {
    setWidget(invokable.id, { values, invokable });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return bindings?.values as T;
};
