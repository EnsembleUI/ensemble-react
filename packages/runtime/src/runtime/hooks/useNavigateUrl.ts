import type {
  EnsembleScreenModel,
  NavigateUrlAction,
} from "@ensembleui/react-framework";
import { isNil, isString, merge } from "lodash-es";
import { useNavigate } from "react-router-dom";
import {
  useCommandCallback,
  evaluate,
  visitExpressions,
  replace,
  useScreenModel,
} from "@ensembleui/react-framework";
import { useMemo, useCallback } from "react";
import { navigateUrl } from "../navigation";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();
  const screenModel = useScreenModel();

  // Memoize url evaluation function
  const evaluateUrl = useCallback(
    (
      url: string,
      model?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): string => evaluate<string>({ model }, url, context),
    [],
  );

  // Memoize inputs evaluation function
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

  // Memoize the navigation logic
  const handleNavigation = useCallback(
    (evaluatedUrl: string, evaluatedInputs?: { [key: string]: unknown }) => {
      if (!evaluatedUrl) return;
      navigateUrl(evaluatedUrl, navigate, evaluatedInputs);
    },
    [navigate],
  );

  // Memoize the command callback dependencies
  const commandDependencies = useMemo(
    () => ({
      action,
      screenModel,
      evaluateUrl,
      evaluateInputs,
      handleNavigation,
    }),
    [action, screenModel, evaluateUrl, evaluateInputs, handleNavigation],
  );

  // Create stable command callback
  const navigateCommand = useCommandCallback(
    (evalContext, ...args) => {
      if (!commandDependencies.action) return;

      const context = merge({}, evalContext, args[0]);

      if (isString(commandDependencies.action)) {
        const evaluatedUrl = commandDependencies.evaluateUrl(
          commandDependencies.action,
          commandDependencies.screenModel,
          context,
        );
        commandDependencies.handleNavigation(evaluatedUrl);
        return;
      }

      const evaluatedUrl = commandDependencies.evaluateUrl(
        commandDependencies.action.url,
        commandDependencies.screenModel,
        context,
      );

      const evaluatedInputs = isNil(commandDependencies.action.inputs)
        ? undefined
        : commandDependencies.evaluateInputs(
            commandDependencies.action.inputs,
            commandDependencies.screenModel,
            context,
          );

      commandDependencies.handleNavigation(evaluatedUrl, evaluatedInputs);
    },
    { navigate },
    [commandDependencies],
  );

  console.log("ko");
  // Return memoized object reference
  return useMemo(() => ({ callback: navigateCommand }), [navigateCommand]);
};
