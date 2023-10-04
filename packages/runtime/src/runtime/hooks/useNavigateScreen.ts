import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { NavigateScreenAction } from "framework";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  name?: string,
) => {
  const navigate = useNavigate();
  const callback = useCallback(() => {
    if (!name) {
      return;
    }
    navigate(`/${name.toLowerCase()}`);
  }, [name, navigate]);
  return { callback };
};
