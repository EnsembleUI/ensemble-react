import { useContext } from "react";
import {
  type EnsembleActionHookResult,
  useCommandCallback,
} from "@ensembleui/react-framework";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../modal";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useCloseAllDialogs: EnsembleActionHook<
  EnsembleActionHookResult
> = () => {
  const modalContext = useContext(ModalContext);
  const navigate = useNavigate();

  const callback = useCommandCallback(
    () => {
      modalContext?.closeAllModals();
    },
    { navigate },
    [modalContext],
  );

  return { callback };
};
