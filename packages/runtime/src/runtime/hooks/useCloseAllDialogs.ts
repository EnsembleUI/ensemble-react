import {
  EnsembleActionHook,
  EnsembleActionHookResult,
} from "./useEnsembleAction";
import { GlobalModal } from "react-global-modal-plus";

export const useCloseAllDialogs: EnsembleActionHook<
  boolean,
  null,
  EnsembleActionHookResult
> = () => {
  const closeAllDialogs: () => void = () => {
    GlobalModal.closeAll();
  };

  return { callback: closeAllDialogs };
};
