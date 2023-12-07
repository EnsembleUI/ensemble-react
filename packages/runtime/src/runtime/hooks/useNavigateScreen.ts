import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useScreenContext,
  type NavigateScreenAction,
  createStorageApi,
  evaluate,
  findExpressions,
} from "@ensembleui/react-framework";
import { isString, set } from "lodash-es";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  action,
) => {
  const navigate = useNavigate();
  const hasOptions = !isString(action);
  const screenName = hasOptions ? action?.name : action;
  const screenContext = useScreenContext();

  const { matchingScreen } = useMemo(() => {
    const screen = screenContext?.app?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase(),
    );
    return { matchingScreen: screen };
  }, [screenContext, screenName]);

  const callback = useMemo(() => {
    if (!matchingScreen) {
      return;
    }
    const inputs = !isString(action) && action?.inputs ? action.inputs : {};
    if (screenContext) {
      const expressionMap: string[][] = [];
      const storage = createStorageApi(screenContext.storage);
      findExpressions(inputs, [], expressionMap);
      expressionMap.forEach(([path, value]) => {
        const result = evaluate(screenContext, value, {
          ensemble: { storage },
        });
        set(inputs, path, result);
      });
    }

    return () => {
      navigate(`/${matchingScreen.name.toLowerCase()}`, { state: inputs });
    };
  }, [matchingScreen, action, screenContext, navigate]);
  return callback ? { callback } : undefined;
};
