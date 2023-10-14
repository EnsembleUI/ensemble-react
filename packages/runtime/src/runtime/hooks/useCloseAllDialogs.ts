import { useContext } from "react";
import { ModalContext } from "../modal";
import {
  EnsembleActionHook,
  EnsembleActionHookResult,
} from "./useEnsembleAction";

export const useCloseAllDialogs: EnsembleActionHook<
  EnsembleActionHookResult
> = () => {
  const { setVisible } = useContext(ModalContext);

  const closeAllDialogs: () => void = () => setVisible(false);

  return { callback: closeAllDialogs };
};
