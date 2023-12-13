import { useMemo } from "react";
import { useAtomValue } from "jotai";
import type { Expression } from "../shared";
import { createBindingAtom } from "../state";
import { useEnsembleStorage } from "./useEnsembleStorage";
import { useCustomScope } from "./useCustomScope";

export const useEvaluate = <T = unknown>(
  expr: Expression<T>,
): T | undefined => {
  const storage = useEnsembleStorage();
  const customScope = useCustomScope();
  const valueAtom = useMemo(
    () => createBindingAtom<T>(expr, { ensemble: { storage }, ...customScope }),
    [customScope, expr, storage],
  );
  const value = useAtomValue(valueAtom);
  return value;
};
