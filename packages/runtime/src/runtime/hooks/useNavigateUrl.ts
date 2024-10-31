import type {
  EnsembleScreenModel,
  NavigateUrlAction,
} from "@ensembleui/react-framework";
import { isNil, isString, merge } from "lodash-es";
import { useNavigate } from "react-router-dom";
import {
  useCommandCallback,
  evaluate,
  visitAndReplaceExpressions,
  expressionReplacer,
  useScreenModel,
} from "@ensembleui/react-framework";
import { useCallback } from "react";
// eslint-disable-next-line import/no-cycle
import { navigateUrl } from "../navigation";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateUrl: EnsembleActionHook<NavigateUrlAction> = (
  action,
) => {
  const navigate = useNavigate();
  const screenModal = useScreenModel();

  const evaluateUrl = useCallback(
    (
      url: string,
      screenModel?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): string => {
      return evaluate<string>({ model: screenModel }, url, context);
    },
    [],
  );

  const evaluateInputs = useCallback(
    (
      inputs: { [key: string]: unknown },
      screenModel?: EnsembleScreenModel,
      context?: { [key: string]: unknown },
    ): { [key: string]: unknown } => {
      const resolvedInputs = visitAndReplaceExpressions(
        inputs,
        expressionReplacer((expr) =>
          evaluate({ model: screenModel }, expr, context),
        ),
      );
      return resolvedInputs as { [key: string]: unknown };
    },
    [],
  );

  const navigateCommand = useCommandCallback(
    (evalContext, ...args) => {
      if (!action) return;

      const context = merge({}, evalContext, args[0]);

      if (isString(action)) {
        const evaluatedUrl = evaluateUrl(action, screenModal, context);
        navigate(evaluatedUrl);
        return;
      }

      const evaluatedUrl = evaluateUrl(action.url, screenModal, context);
      const evaluatedInputs = isNil(action.inputs)
        ? undefined
        : evaluateInputs(action.inputs, screenModal, context);

      navigateUrl(evaluatedUrl, navigate, evaluatedInputs);
    },
    { navigate },
    [action, screenModal],
  );

  return { callback: navigateCommand };
};
