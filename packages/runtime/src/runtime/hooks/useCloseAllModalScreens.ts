import { useContext } from "react";
import {
  type EnsembleActionHookResult,
  useCommandCallback,
} from "@ensembleui/react-framework";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../modal";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useCloseAllScreens: EnsembleActionHook<
  EnsembleActionHookResult
> = () => {
  const modalContext = useContext(ModalContext);
  const navigate = useNavigate();

  const callback = useCommandCallback(
    () => {
      modalContext?.closeAllScreens();
    },
    { navigate },
    [modalContext],
  );

  return { callback };
};
