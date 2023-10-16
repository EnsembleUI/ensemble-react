import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { NavigateScreenAction } from "framework";
import { isString } from "lodash-es";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  action,
) => {
  const navigate = useNavigate();
  const screenName = isString(action) ? action : action?.name;
  const callback = useMemo(() => {
    if (!screenName) {
      return;
    }
    return () => {
      navigate(`/${screenName.toLowerCase()}`);
    };
  }, [screenName, navigate]);
  return callback ? { callback } : undefined;
};
