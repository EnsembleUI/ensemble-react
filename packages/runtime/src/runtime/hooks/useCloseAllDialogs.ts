import { useContext, useMemo } from "react";
import { type EnsembleActionHookResult } from "@ensembleui/react-framework";
import { ModalContext } from "../modal";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useCloseAllDialogs: EnsembleActionHook<
  EnsembleActionHookResult
> = () => {
  const { closeAllModals } = useContext(ModalContext) || {};

  return useMemo(
    () => ({
      callback: () => closeAllModals?.(),
    }),
    [],
  );
};
