import type {
  EnsembleScreenModel,
  NavigateUrlAction,
} from "@ensembleui/react-framework";
import { get, isNil, isString, merge } from "lodash-es";
import type { NavigateOptions } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCommandCallback, evaluate } from "@ensembleui/react-framework";
import { useCallback } from "react";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();

  const evaluateUrl = useCallback(
    (
      url: string,
      defaultScreenModel?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): string => {
      return evaluate<string>({ model: defaultScreenModel }, url, context);
    },
    [],
  );

  const evaluateInputs = useCallback(
    (
      inputs: { [key: string]: unknown },
      defaultScreenModel?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): { [key: string]: unknown } => {
      const inputString = JSON.stringify(inputs).replace(
        // eslint-disable-next-line prefer-named-capture-group
        /['"]\$\{([^}]*)\}['"]/g,
        "$1",
      );
      return evaluate({ model: defaultScreenModel }, inputString, context);
    },
    [],
  );

  const navigateCommand = useCommandCallback(
    (evalContext, ...args) => {
      if (!action) return;

      const context = merge({}, evalContext, args[0]);
      const defaultScreenModel = get(evalContext, "screenContextModel") as
        | EnsembleScreenModel
        | undefined;

      if (isString(action)) {
        const evaluatedUrl = evaluateUrl(action, defaultScreenModel, context);
        navigate(evaluatedUrl);
        return;
      }

      const evaluatedUrl = evaluateUrl(action.url, defaultScreenModel, context);
      const navigationOptions: NavigateOptions = {};

      if (!isNil(action.inputs)) {
        navigationOptions.state = evaluateInputs(
          action.inputs,
          defaultScreenModel,
          context,
        );
      }

      navigate(evaluatedUrl, navigationOptions);
    },
    { navigate },
    [action],
  );

  return { callback: navigateCommand };
};
