import {
  DataFetcher,
  useScreenContext,
  evaluate,
  isExpression,
} from "framework";
import type {
  InvokeAPIAction,
  ExecuteCodeAction,
  Response,
  EnsembleAction,
} from "framework";
import { isString, merge } from "lodash-es";
import { useState, useEffect, useMemo } from "react";
import { useNavigateScreen } from "./useNavigateScreen";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useNavigateModalScreen } from "./useNavigateModal";
import { useShowToast } from "./useShowToast";

export type EnsembleActionHookResult =
  | {
      callback: (...args: unknown[]) => unknown;
    }
  | undefined;
export type EnsembleActionHook<
  T = unknown,
  Q = unknown,
  R extends EnsembleActionHookResult = EnsembleActionHookResult,
> = (action?: T, options?: Q) => R;

export interface UseExecuteCodeActionOptions {
  context?: Record<string, unknown>;
}
export const useExecuteCode: EnsembleActionHook<
  ExecuteCodeAction,
  UseExecuteCodeActionOptions
> = (action, options) => {
  const isCodeString = isString(action);
  const js = isCodeString ? action : action?.body;
  const screen = useScreenContext();
  const onCompleteAction = useEnsembleAction(
    isCodeString ? undefined : action?.onComplete
  );
  const execute = useMemo(() => {
    if (!screen || !js) {
      return;
    }

    return (args: unknown) => {
      console.log("Am i the one coming again n again", args);
      const retVal = evaluate(screen, js, merge({}, options?.context, args));
      onCompleteAction?.callback();
      return retVal;
    };
  }, [screen, js, options?.context, onCompleteAction]);
  return execute ? { callback: execute } : undefined;
};

export const useInvokeApi: EnsembleActionHook<InvokeAPIAction> = (action) => {
  const screenContext = useScreenContext();

  const [response, setResponse] = useState<Response>();
  const [error, setError] = useState<unknown>();

  const invokeApi = useMemo(() => {
    if (!screenContext?.model || !action) {
      return;
    }

    const apiModel = screenContext.model.apis?.find(
      (model) => model.name === action.name
    );
    if (!apiModel) {
      return;
    }

    const inputs = action.inputs ?? {};
    const callback = async (): Promise<void> => {
      const resolvedInputs = Object.entries(inputs).map(([key, value]) => {
        if (isExpression(value)) {
          const resolvedValue = evaluate(screenContext, value);
          return [key, resolvedValue];
        }
        return [key, value];
      });
      try {
        const res = await DataFetcher.fetch(
          apiModel,
          Object.fromEntries(resolvedInputs) as Record<string, unknown>
        );
        screenContext.setData(apiModel.name, res);
        setResponse(res);
      } catch (e) {
        setError(e);
      }
    };
    return { callback };
  }, [action, screenContext?.model]);

  const onResponseAction = useEnsembleAction(action?.onResponse);
  useEffect(() => {
    if (!response) {
      return;
    }

    onResponseAction?.callback({ response });
  }, [action?.onResponse, onResponseAction, response]);

  const onErrorAction = useEnsembleAction(action?.onError);
  useEffect(() => {
    if (!error) {
      return;
    }

    onErrorAction?.callback({ error });
  }, [action?.onError, error, onErrorAction]);

  return invokeApi;
};

/* eslint-disable react-hooks/rules-of-hooks */
export const useEnsembleAction = (
  action?: EnsembleAction,
  options?: unknown
): EnsembleActionHookResult => {
  // FIXME: Figure out how to chain without breaking rules of hooks and infinite loop
  if (!action) {
    return;
  }
  const invokeApi = useInvokeApi(action.invokeApi, options);
  const executeCode = useExecuteCode(
    action.executeCode,
    options as UseExecuteCodeActionOptions
  );
  const navigateScreen = useNavigateScreen(action.navigateScreen, options);
  const navigateModalScreen = useNavigateModalScreen(
    action.navigateModalScreen,
    options as null
  );
  const showToast = useShowToast(action.showToast);
  return (
    invokeApi ||
    executeCode ||
    navigateScreen ||
    navigateModalScreen ||
    showToast
  );
};
/* eslint-enable react-hooks/rules-of-hooks */
