import type {
  EnsembleScreenModel,
  NavigateScreenAction,
} from "@ensembleui/react-framework";
import { isNil, isString, merge, cloneDeep } from "lodash-es";
import { useNavigate } from "react-router-dom";
import {
  useCommandCallback,
  evaluate,
  visitExpressions,
  replace,
  useScreenModel,
  useApplicationContext,
} from "@ensembleui/react-framework";
import { useCallback, useMemo } from "react";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  action,
) => {
  const navigate = useNavigate();
  const screenModel = useScreenModel();
  const appContext = useApplicationContext();

  const evaluateScreenName = useCallback(
    (
      name: string,
      model?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): string => {
      return evaluate<string>({ model }, name, context);
    },
    [],
  );

  const evaluateInputs = useCallback(
    (
      inputs: { [key: string]: unknown },
      model?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): { [key: string]: unknown } => {
      const resolvedInputs = visitExpressions(
        inputs,
        replace((expr) => evaluate({ model }, expr, context)),
      );
      return resolvedInputs as { [key: string]: unknown };
    },
    [],
  );

  const navigateCommand = useCommandCallback(
    (evalContext, ...args) => {
      if (!action) return;

      const context = merge({}, evalContext, args[0]);

      const screenName = isString(action) ? action : action.name;
      const evaluatedName = evaluateScreenName(
        screenName,
        screenModel,
        context,
      );

      const matchingScreen = appContext?.application?.screens.find(
        (s) => s.name?.toLowerCase() === evaluatedName.toLowerCase(),
      );

      if (!matchingScreen?.name) return;

      const evaluatedInputs =
        !isString(action) && !isNil(action.inputs)
          ? evaluateInputs(cloneDeep(action.inputs), screenModel, context)
          : undefined;

      navigate(`/${matchingScreen.name.toLowerCase()}`, {
        state: evaluatedInputs,
      });
    },
    { navigate },
    [action, screenModel, appContext],
  );

  return useMemo(() => ({ callback: navigateCommand }), [navigateCommand]);
};
