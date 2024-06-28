import { useEffect, useMemo, useState } from "react";
import { isString } from "lodash-es";
import {
  useEvaluate,
  type NavigateExternalScreen,
} from "@ensembleui/react-framework";
// eslint-disable-next-line import/no-cycle
import { openExternalScreen } from "../navigation";
import { type EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateExternalScreen: EnsembleActionHook<
  NavigateExternalScreen
> = (action) => {
  const [screenNavigated, setScreenNavigated] = useState<boolean>();
  const [context, setContext] = useState<{ [key: string]: unknown }>();
  const evaluatedInputs = useEvaluate(
    isString(action) ? { url: action } : { ...action },
    { context },
  );

  const navigateScreen = useMemo(() => {
    if (!action) {
      return;
    }

    const callback = (args: unknown): void => {
      setScreenNavigated(false);
      setContext(args as { [key: string]: unknown });
    };

    return { callback };
  }, [action]);

  useEffect(() => {
    if (!evaluatedInputs.url || screenNavigated !== false) {
      return;
    }

    setScreenNavigated(true);
    return openExternalScreen(evaluatedInputs as NavigateExternalScreen);
  }, [evaluatedInputs, screenNavigated]);

  return navigateScreen;
};
