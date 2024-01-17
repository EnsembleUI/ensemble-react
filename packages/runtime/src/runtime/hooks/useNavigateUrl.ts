import { useNavigate } from "react-router-dom";
import { cloneDeep, isString, set } from "lodash-es";
import { useMemo } from "react";
import {
  evaluate,
  findExpressions,
  useCustomScope,
  useEnsembleStorage,
  useScreenContext,
  type NavigateUrlAction,
} from "@ensembleui/react-framework";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();
  const hasOptions = !isString(action);
  const screenUrl = hasOptions ? action?.url : action;
  const screenContext = useScreenContext();
  const customScope = useCustomScope();
  const storage = useEnsembleStorage();

  const callback = useMemo(() => {
    const inputs =
      !isString(action) && action?.inputs ? cloneDeep(action.inputs) : {};

    if (screenContext) {
      const expressionMap: string[][] = [];
      findExpressions(inputs, [], expressionMap);
      expressionMap.forEach(([path, value]) => {
        const result = evaluate(screenContext, value, {
          ensemble: {
            storage,
          },
          ...customScope,
        });
        set(inputs, path, result);
      });
    }

    return () => {
      navigate(screenUrl, { state: inputs });
    };
  }, [screenUrl, action, screenContext, storage, customScope, navigate]);

  return callback ? { callback } : undefined;
};
