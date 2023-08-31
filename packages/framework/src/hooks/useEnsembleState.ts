import { Invokable, useEnsembleStore } from "../state";
import { useScreenContext } from "./useScreenContext";

export const useEnsembleState = <T extends Record<string, unknown>>(
  invokable: Invokable,
  values: T,
): T | null => {
  const screenContext = useScreenContext();
  const { setWidget } = useEnsembleStore();
  if (!screenContext) {
    return null;
  }
  setWidget(invokable.id, { values, invokable });
  return values;
};
