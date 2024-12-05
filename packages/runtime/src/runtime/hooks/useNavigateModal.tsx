import type { NavigateModalScreenAction } from "@ensembleui/react-framework";
import {
  unwrapWidget,
  useApplicationContext,
  useEvaluate,
} from "@ensembleui/react-framework";
import { cloneDeep, isString } from "lodash-es";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  const applicationContext = useApplicationContext();
  const modalContext = useContext(ModalContext);
  const ensembleAction = useEnsembleAction(
    !isString(action) && action ? action.onModalDismiss : undefined,
  );
  const [context, setContext] = useState<unknown>();
  const [isComplete, setIsComplete] = useState<boolean>();

  const evaluatedInputs = useEvaluate(
    {
      inputs:
        !isString(action) && action?.inputs ? cloneDeep(action.inputs) : {},
    },
    { context },
  );

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
      if (!action) {
        return;
      }
      setIsComplete(false);
      setContext(args);
    },
    [action],
  );

  useEffect(() => {
    if (!action || !modalContext || isComplete !== false) {
      return;
    }

    navigateModalScreen(
      action,
      modalContext,
      applicationContext?.application,
      evaluatedInputs.inputs,
      title,
      onDismissCallback,
    );
    setIsComplete(true);
  }, [
    action,
    applicationContext?.application,
    evaluatedInputs.inputs,
    isComplete,
    modalContext,
    onDismissCallback,
    title,
  ]);

  return { callback };
};
