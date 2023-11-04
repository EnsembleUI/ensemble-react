import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type NavigateScreenAction } from "@ensembleui/react-framework";
import { isEmpty, isString } from "lodash-es";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  action,
) => {
  const navigate = useNavigate();
  const hasOptions = !isString(action);
  const screenName = hasOptions ? action?.name : action;

  const callback = useMemo(() => {
    if (!screenName) {
      return;
    }
    let queryString = "";
    if (hasOptions) {
      const searchParams = new URLSearchParams(
        action?.inputs as Record<string, string>,
      ).toString();
      if (!isEmpty(searchParams)) {
        queryString = `?${searchParams}`;
      }
    }
    return () => {
      navigate(`/${screenName.toLowerCase()}${queryString}`);
    };
  }, [screenName, navigate, hasOptions, action]);
  return callback ? { callback } : undefined;
};
