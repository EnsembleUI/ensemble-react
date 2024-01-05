import { useContext } from "react";
import { ModalContext } from "../modal";
import type {
  EnsembleActionHook,
  EnsembleActionHookResult,
} from "./useEnsembleAction";

export const useCloseAllDialogs: EnsembleActionHook<
  EnsembleActionHookResult
> = () => {
  const { closeAllModals } = useContext(ModalContext) || {};

  const closeAllDialogs: () => void = () => closeAllModals?.();

  return { callback: closeAllDialogs };
};
