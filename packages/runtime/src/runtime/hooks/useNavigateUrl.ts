import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  type NavigateUrlAction,
  useCustomScope,
  useEnsembleStorage,
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
  const inputs = useMemo(
    () => (!isString(action) && action?.inputs ? cloneDeep(action.inputs) : {}),
    [action],
  );
  const customScope = useCustomScope();
  const storage = useEnsembleStorage();
  const evaluatedRes = useEvaluate(
    { url: screenUrl, inputs },
    {
      context: {
        ensemble: {
          storage,
        },
        ...customScope,
      },
    },
  );

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
