import { useCallback } from "react";
import { useEnsembleStore } from "../state";

export const useEvaluate = (
  js?: string,
  context?: Record<string, unknown> | null,
): (() => unknown) => {
  const store = useEnsembleStore();
  const execute = useCallback((): unknown => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const jsFunc = new Function(
      "store",
      "context",
      js ?? "console.log('No expression was given')",
    );
    return jsFunc(store, context);
  }, [context, js, store]);
  return execute;
};
