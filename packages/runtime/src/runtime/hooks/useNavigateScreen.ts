import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type NavigateScreenAction,
  useEvaluate,
  useApplicationContext,
} from "@ensembleui/react-framework";
import { cloneDeep, isString } from "lodash-es";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  action,
) => {
  const navigate = useNavigate();
  const hasOptions = !isString(action);
  const screenName = hasOptions ? action?.name : action;
  const appContext = useApplicationContext();
  const [context, setContext] = useState<unknown>();
  const [isComplete, setIsComplete] = useState<boolean>();

  const { matchingScreen } = useMemo(() => {
    const screen = appContext?.application?.screens.find(
      (s) => s.name?.toLowerCase() === screenName?.toLowerCase(),
    );
    return { matchingScreen: screen };
  }, [appContext, screenName]);

  const evaluatedInputs = useEvaluate(
    !isString(action) ? cloneDeep(action?.inputs) : undefined,
    { context },
  );

  const callback = useMemo(() => {
    if (!matchingScreen) {
      return;
    }
    return (args: unknown) => {
      setIsComplete(false);
      setContext(args);
    };
  }, [matchingScreen]);

  useEffect(() => {
    if (!matchingScreen?.name || isComplete !== false) {
      return;
    }
    navigate(`/${matchingScreen.name.toLowerCase()}`, {
      state: evaluatedInputs,
    });
    setIsComplete(true);
  }, [evaluatedInputs, isComplete, matchingScreen, navigate]);
  return callback ? { callback } : undefined;
};
