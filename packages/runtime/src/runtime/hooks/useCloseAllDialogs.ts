import { useContext } from "react";
import { ModalContext } from "../modal";
import type {
  EnsembleActionHook,
  EnsembleActionHookResult,
} from "./useEnsembleAction";

export const useCloseAllDialogs: EnsembleActionHook<
  EnsembleActionHookResult
> = () => {
  const { closeModal } = useContext(ModalContext) || {};

  const closeAllDialogs: () => void = () => closeModal?.();

  return { callback: closeAllDialogs };
};
