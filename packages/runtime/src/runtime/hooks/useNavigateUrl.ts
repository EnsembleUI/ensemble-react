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
import { useCallback } from "react";
// eslint-disable-next-line import/no-cycle
import { navigateUrl } from "../navigation";
import type { EnsembleActionHook } from "./useEnsembleAction";

const evaluateExpression = (
  expr: string,
  screenModel?: EnsembleScreenModel,
  context?: { [key: string]: unknown },
): string => {
  return evaluate<string>({ model: screenModel }, expr, context);
};

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();
  const screenModal = useScreenModel();

  // Memoize the URL evaluation function
  const evaluateUrl = useCallback(
    (
      url: string,
      screenModel?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): string => {
      if (!isExpression(url)) return url;
      return evaluateExpression(url, screenModel, context);
    },
    [],
  );

  // Memoize the inputs evaluation function
  const evaluateInputs = useCallback(
    (
      inputs: { [key: string]: unknown },
      screenModel?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): { [key: string]: unknown } => {
      return visitExpressions(
        inputs,
        replace((expr) => evaluate({ model: screenModel }, expr, context)),
      ) as { [key: string]: unknown };
    },
    [],
  );

  // Memoize the navigation handler for string actions
  const handleStringAction = useCallback(
    (actionUrl: string, context: { [key: string]: unknown }) => {
      const resolvedUrl = evaluateUrl(actionUrl, screenModal, context);
      navigate(resolvedUrl);
    },
    [navigate, evaluateUrl, screenModal],
  );

  // Memoize the navigation handler for object actions
  const handleObjectAction = useCallback(
    (
      actionUrl: string,
      actionInputs: { [key: string]: unknown } | undefined,
      context: { [key: string]: unknown },
    ) => {
      const resolvedUrl = evaluateUrl(actionUrl, screenModal, context);

      const resolvedInputs = isNil(actionInputs)
        ? undefined
        : evaluateInputs(actionInputs, screenModal, context);

      navigateUrl(resolvedUrl, navigate, resolvedInputs);
    },
    [navigate, evaluateUrl, evaluateInputs, screenModal],
  );

  const navigateCommand = useCommandCallback(
    (evalContext, ...args) => {
      if (!action) return;

      const context = merge({}, evalContext, args[0]);

      if (isString(action)) {
        handleStringAction(action, context);
        return;
      }

      handleObjectAction(action.url, action.inputs, context);
    },
    { navigate },
    [action, handleStringAction, handleObjectAction],
  );

  return { callback: navigateCommand };
};
