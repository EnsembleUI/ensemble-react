import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  type NavigateScreenAction,
  ensembleStore,
  screenAtom,
} from "@ensembleui/react-framework";
import { isString, merge } from "lodash-es";
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
    return () => {
      navigate(`/${screenName.toLowerCase()}`);
      if (hasOptions) {
        const context = ensembleStore.get(screenAtom);
        context.inputs = merge({}, action?.inputs);
        ensembleStore.set(screenAtom, context);
      }
    };
  }, [screenName, navigate, hasOptions, action]);
  return callback ? { callback } : undefined;
};
