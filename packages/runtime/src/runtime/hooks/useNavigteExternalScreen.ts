import { useMemo } from "react";
import { type NavigateExternalScreen } from "@ensembleui/react-framework";
import { openExternalScreen } from "../navigation";
import { type EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateExternalScreen: EnsembleActionHook<
  NavigateExternalScreen
> = (action) => {
  const callback = useMemo(() => {
    if (!action) {
      return;
    }

    openExternalScreen(action);
  }, [action]);

  return callback ? { callback } : undefined;
};
