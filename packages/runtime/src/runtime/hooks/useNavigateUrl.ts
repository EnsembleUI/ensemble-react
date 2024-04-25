import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type NavigateUrlAction,
  useEvaluate,
} from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();
  const [urlNavigated, setUrlNavigated] = useState<boolean>();
  const [context, setContext] = useState<{ [key: string]: unknown }>();

  const evaluatedInputs = useEvaluate(
    isString(action) ? { url: action } : { ...action },
    { context },
  );

  const navigateUrl = useMemo(() => {
    if (!action) {
      return;
    }

    const callback = (args: unknown): void => {
      setUrlNavigated(false);
      setContext(args as { [key: string]: unknown });
    };

    return { callback };
  }, [action]);

  useEffect(() => {
    if (!evaluatedInputs.url || urlNavigated !== false) {
      return;
    }

    setUrlNavigated(true);
    return navigate(evaluatedInputs.url, { state: evaluatedInputs.inputs });
  }, [urlNavigated, evaluatedInputs]);

  return navigateUrl;
};
