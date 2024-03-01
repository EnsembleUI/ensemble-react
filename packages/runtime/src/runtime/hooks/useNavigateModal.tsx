import type { NavigateModalScreenAction } from "@ensembleui/react-framework";
import {
  evaluate,
  findExpressions,
  unwrapWidget,
  useCustomScope,
  useEnsembleStorage,
  useScreenContext,
} from "@ensembleui/react-framework";
import { cloneDeep, isObject, isString, merge, set } from "lodash-es";
import { useCallback, useContext, useMemo } from "react";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { EnsembleScreen } from "../screen";
import { ModalContext } from "../modal";
import { EnsembleRuntime } from "../runtime";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction
> = (action?: NavigateModalScreenAction) => {
  const { openModal } = useContext(ModalContext) || {};
  const screenContext = useScreenContext();
  const customScope = useCustomScope();
  const storage = useEnsembleStorage();

  const isStringAction = isString(action);
  const screenName = isStringAction ? action : action?.name;

  const title = useMemo(() => {
    if (!isStringAction && action?.title && !isString(action.title)) {
      return EnsembleRuntime.render([unwrapWidget(action.title)]);
    }
  }, [isStringAction, action]);

  const { matchingScreen } = useMemo(() => {
    const screen = screenContext?.app?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase(),
    );
    return { matchingScreen: screen };
  }, [screenContext, screenName]);

  const callback = useCallback(() => {
    if (!matchingScreen) {
      return;
    }

    const inputs =
      !isString(action) && action?.inputs ? cloneDeep(action.inputs) : {};
    if (screenContext) {
      const expressionMap: string[][] = [];
      findExpressions(inputs, [], expressionMap);
      expressionMap.forEach(([path, value]) => {
        const result = evaluate(screenContext, value, {
          ensemble: { storage },
          ...customScope,
        });
        set(inputs, path, result);
      });
    }

    // modal options
    const modalOptions = {
      maskClosable: true,
      hideCloseIcon: true,
      hideFullScreenIcon: true,
      padding: "12px",
    };
    if (isObject(action)) {
      merge(modalOptions, action, { ...action.styles }, { title });
    }

    openModal?.(
      <EnsembleScreen inputs={inputs} screen={matchingScreen} />,
      modalOptions,
    );
  }, [
    matchingScreen,
    action,
    screenContext,
    openModal,
    storage,
    customScope,
    title,
  ]);

  return { callback };
};
