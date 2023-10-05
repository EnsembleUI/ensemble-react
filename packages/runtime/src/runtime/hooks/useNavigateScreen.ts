import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { NavigateScreenAction } from "framework";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  name?: string,
) => {
  const navigate = useNavigate();
  const callback = useMemo(() => {
    if (!name) {
      return;
    }
    return () => {
      navigate(`/${name.toLowerCase()}`);
    };
  }, [name, navigate]);
  return callback ? { callback } : undefined;
};
