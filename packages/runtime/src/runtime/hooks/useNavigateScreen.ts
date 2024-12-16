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
  const appContext = useApplicationContext();
  const [context, setContext] = useState<unknown>();
  const [isComplete, setIsComplete] = useState<boolean>();

  const evaluatedInputs = useEvaluate(
    {
      inputs: hasOptions ? cloneDeep(action?.inputs) : null,
      name: hasOptions ? action?.name : action,
    },
    { context },
  );

  const { matchingScreen } = useMemo(() => {
    const screen = appContext?.application?.screens.find(
      (s) => s.name?.toLowerCase() === evaluatedInputs.name?.toLowerCase(),
    );
    return { matchingScreen: screen };
  }, [appContext, evaluatedInputs.name]);

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
      state: evaluatedInputs.inputs,
    });
    setIsComplete(true);
  }, [evaluatedInputs.inputs, isComplete, matchingScreen, navigate]);
  return callback ? { callback } : undefined;
};
