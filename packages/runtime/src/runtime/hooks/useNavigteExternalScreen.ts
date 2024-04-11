import { useMemo } from "react";
import { isString, merge } from "lodash-es";
import {
  evaluate,
  useEnsembleStorage,
  useScreenContext,
  type NavigateExternalScreen,
} from "@ensembleui/react-framework";
import { openExternalScreen } from "../navigation";
import { type EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateExternalScreen: EnsembleActionHook<
  NavigateExternalScreen
> = (action) => {
  const screen = useScreenContext();
  const storage = useEnsembleStorage();

  const callback = useMemo(() => {
    if (!screen || !action) {
      return;
    }

    return (args?: unknown) => {
      const url = evaluate<{ [key: string]: unknown }>(
        screen,
        isString(action) ? action : action.url,
        merge({ ensemble: { storage } }, args),
      );

      if (!url || !isString(url)) {
        return;
      }

      return openExternalScreen({ url } as NavigateExternalScreen);
    };
  }, [screen, storage, action]);

  return callback ? { callback } : undefined;
};
