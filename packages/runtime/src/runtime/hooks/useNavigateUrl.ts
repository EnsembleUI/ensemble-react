import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  type NavigateUrlAction,
  useEvaluate,
} from "@ensembleui/react-framework";
import { cloneDeep, isString } from "lodash-es";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();
  const hasOptions = !isString(action);
  const screenUrl = hasOptions ? action?.url : action;
  const evaluationInput = useMemo(() => {
    if (!isString(action)) {
      return {
        url: screenUrl,
        inputs: cloneDeep(action?.inputs),
      };
    }
    return { url: screenUrl };
  }, [action, screenUrl]);
  const evaluatedRes = useEvaluate(evaluationInput);

  const callback = useMemo(() => {
    if (!evaluatedRes.url) {
      return;
    }

    return () => {
      navigate(String(evaluatedRes.url), { state: evaluatedRes.inputs });
    };
  }, [evaluatedRes.inputs, evaluatedRes.url, navigate]);

  return callback ? { callback } : undefined;
};
