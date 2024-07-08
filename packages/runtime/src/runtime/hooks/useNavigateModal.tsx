import type {
  EnsembleAction,
  NavigateModalScreenAction,
} from "@ensembleui/react-framework";
import {
  evaluate,
  findExpressions,
  unwrapWidget,
  useCustomScope,
  useEnsembleStorage,
  useScreenContext,
} from "@ensembleui/react-framework";
import { cloneDeep, isString, set } from "lodash-es";
import { useCallback, useContext, useMemo } from "react";
import { ModalContext } from "../modal";
import { EnsembleRuntime } from "../runtime";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { navigateModalScreen } from "../navigation";
import {
  useEnsembleAction,
  type EnsembleActionHook,
} from "./useEnsembleAction";

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction
> = (action?: NavigateModalScreenAction) => {
  const modalContext = useContext(ModalContext);
  const screenContext = useScreenContext();
  const customScope = useCustomScope();
  const storage = useEnsembleStorage();
  const ensembleAction = useEnsembleAction(action?.onModalDismiss);

  const onDismissCallback = useCallback(() => {
    if (!ensembleAction) {
      return;
    }
    ensembleAction.callback();
  }, [ensembleAction]);

  const isStringAction = isString(action);

  const title = useMemo(() => {
    if (!isStringAction && action?.title && !isString(action.title)) {
      return EnsembleRuntime.render([unwrapWidget(action.title)]);
    }
  }, [isStringAction, action]);

  const callback = useCallback(
    (args: unknown) => {
      if (!action || !screenContext || !modalContext) {
        return;
      }

      const inputs =
        !isString(action) && action.inputs ? cloneDeep(action.inputs) : {};
      if (screenContext) {
        const expressionMap: string[][] = [];
        findExpressions(inputs, [], expressionMap);
        expressionMap.forEach(([path, value]) => {
          const result = evaluate(screenContext, value, {
            ensemble: { storage },
            ...customScope,
            ...(args as { [key: string]: unknown }),
          });
          set(inputs, path, result);
        });
      }

      navigateModalScreen(
        action,
        screenContext,
        modalContext,
        inputs,
        title,
        onDismissCallback,
      );
    },
    [
      action,
      screenContext,
      modalContext,
      title,
      storage,
      customScope,
      onDismissCallback,
    ],
  );

  return { callback };
};
