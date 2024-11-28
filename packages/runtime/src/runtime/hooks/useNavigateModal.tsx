import type { NavigateModalScreenAction } from "@ensembleui/react-framework";
import {
  unwrapWidget,
  useApplicationContext,
  useScreenModel,
  useCommandCallback,
} from "@ensembleui/react-framework";
import { cloneDeep, isNil, isString, merge } from "lodash-es";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../modal";
import { EnsembleRuntime } from "../runtime";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { navigateModalScreen } from "../navigation";
import { evaluateInputs } from "../../shared/common";
import {
  useEnsembleAction,
  type EnsembleActionHook,
} from "./useEnsembleAction";

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction
> = (action) => {
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const modalContext = useContext(ModalContext);
  const screenModel = useScreenModel();
  const ensembleAction = useEnsembleAction(
    !isString(action) && action ? action.onModalDismiss : undefined,
  );

  const onClose = (): void => {
    ensembleAction?.callback();
  };

  const isStringAction = isString(action);

  const title = useMemo(() => {
    if (!isStringAction && action?.title && !isString(action.title)) {
      return EnsembleRuntime.render([unwrapWidget(action.title)]);
    }
  }, [isStringAction, action]);

  const navigateCommand = useCommandCallback(
    (evalContext, ...args) => {
      if (!action || !modalContext) return;

      const context = merge({}, evalContext, args[0]);

      const evaluatedInputs =
        !isString(action) && !isNil(action.inputs)
          ? evaluateInputs(cloneDeep(action.inputs), screenModel, context)
          : {};

      navigateModalScreen(
        action,
        modalContext,
        applicationContext?.application,
        evaluatedInputs,
        title,
        onClose,
      );
    },
    { navigate },
    [action, applicationContext?.application, screenModel],
  );
  return useMemo(() => ({ callback: navigateCommand }), [navigateCommand]);
};
