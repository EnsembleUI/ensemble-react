import { useMemo } from "react";
import {
  useEvaluate,
  type NavigateExternalScreen,
} from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import { openExternalScreen } from "../navigation";
import { type EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateExternalScreen: EnsembleActionHook<
  NavigateExternalScreen
> = (action) => {
  const evaluatedAction = useEvaluate(
    isString(action) ? { url: action } : { ...action },
  );
  const callback = useMemo(() => {
    if (!evaluatedAction || !evaluatedAction.url) {
      return;
    }

    return () => openExternalScreen(evaluatedAction as NavigateExternalScreen);
  }, [evaluatedAction]);

  return callback ? { callback } : undefined;
};
