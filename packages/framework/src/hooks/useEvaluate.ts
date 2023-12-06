import { useMemo } from "react";
import { useAtomValue } from "jotai";
import type { Expression } from "../shared";
import { createBindingAtom } from "../state";
import { useEnsembleStorage } from "./useEnsembleStorage";

export const useEvaluate = <T = unknown>(
  expr: Expression<T>,
): T | undefined => {
  const storage = useEnsembleStorage();
  const valueAtom = useMemo(
    () => createBindingAtom<T>(expr, { ensemble: { storage } }),
    [expr, storage],
  );
  const value = useAtomValue(valueAtom);
  return value;
};
