import { useCallback, useContext, useMemo } from "react";
import { type EnsembleActionHookResult } from "@ensembleui/react-framework";
import { ModalContext } from "../modal";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useCloseAllScreens: EnsembleActionHook<
  EnsembleActionHookResult
> = () => {
  const { closeAllScreens } = useContext(ModalContext) || {};

  const callback = useCallback(() => {
    closeAllScreens?.();
  }, [closeAllScreens]);

  return useMemo(() => ({ callback }), [callback]);
};
