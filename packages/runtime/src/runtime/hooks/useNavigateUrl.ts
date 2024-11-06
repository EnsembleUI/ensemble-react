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
  isExpression,
} from "@ensembleui/react-framework";
import { useMemo, useCallback } from "react";
import { navigateUrl } from "../navigation";
import type { EnsembleActionHook } from "./useEnsembleAction";

const evaluateExpression = (
  expr: string,
  screenModel?: EnsembleScreenModel,
  context?: { [key: string]: unknown },
): string => {
  if (!isExpression(expr)) return expr;
  return evaluate<string>({ model: screenModel }, expr, context);
};

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();
  const screenModel = useScreenModel();

  // Memoize the URL evaluation function
  const evaluateUrl = useCallback(
    (
      url: string,
      model?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): string => {
      return evaluateExpression(url, model, context);
    },
    [],
  );

  // Memoize the inputs evaluation function
  const evaluateInputs = useCallback(
    (
      inputs: { [key: string]: unknown },
      model?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): { [key: string]: unknown } => {
      return visitExpressions(
        inputs,
        replace((expr) => evaluate({ model }, expr, context)),
      ) as { [key: string]: unknown };
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

      if (isString(action)) {
        const resolvedUrl = evaluateUrl(action, screenModel, context);
        navigateUrl(resolvedUrl, navigate);
        return;
      }

      const resolvedUrl = evaluateUrl(action.url, screenModel, context);
      const resolvedInputs = isNil(action.inputs)
        ? undefined
        : evaluateInputs(action.inputs, screenModel, context);

      navigateUrl(resolvedUrl, navigate, resolvedInputs);
    },
    { navigate },
    [action, screenModel],
  );

  console.log("ko");
  // Return memoized object reference
  return useMemo(() => ({ callback: navigateCommand }), [navigateCommand]);
};
