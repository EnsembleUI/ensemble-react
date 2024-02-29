import { useMemo } from "react";
import { isString } from "lodash-es";
import { type NavigateExternalScreen } from "@ensembleui/react-framework";
import { type EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateExternalScreen: EnsembleActionHook<
  NavigateExternalScreen
> = (action) => {
  const hasOptions = !isString(action);
  const screenUrl = hasOptions ? action?.url : action;

  const callback = useMemo(() => {
    if (!screenUrl) {
      return;
    }

    return () => {
      window.open(
        screenUrl,
        !isString(action) && !action?.openNewTab ? "_self" : "",
      );
    };
  }, [screenUrl, action]);

  return callback ? { callback } : undefined;
};
