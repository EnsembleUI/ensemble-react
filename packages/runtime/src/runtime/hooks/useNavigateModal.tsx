import type { NavigateModalScreenAction } from "@ensembleui/react-framework";
import {
  createStorageApi,
  evaluate,
  findExpressions,
  useScreenContext,
} from "@ensembleui/react-framework";
import { isString, set } from "lodash-es";
import { useCallback, useContext, useMemo } from "react";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { EnsembleScreen } from "../screen";
import { ModalContext } from "../modal";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction
> = (action?: NavigateModalScreenAction) => {
  const { openModal } = useContext(ModalContext) || {};
  const screenContext = useScreenContext();

  const isStringAction = isString(action);
  const screenName = isStringAction ? action : action?.name;
  const {
    maskClosable = true,
    styles: {
      position = undefined,
      height = undefined,
      width = undefined,
      margin = undefined,
      padding = undefined,
    } = {},
  } = isStringAction ? {} : action || {};

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

    const inputs = !isString(action) && action?.inputs ? action.inputs : {};
    if (screenContext) {
      const expressionMap: string[][] = [];
      const storage = createStorageApi(screenContext.storage);
      findExpressions(inputs, [], expressionMap);
      expressionMap.forEach(([path, value]) => {
        const result = evaluate(screenContext, value, {
          ensemble: { storage },
        });
        set(inputs, path, result);
      });
    }

    openModal?.(
      <EnsembleScreen inputs={inputs} isModal screen={matchingScreen} />,
      {
        maskClosable,
        position,
        height,
        width,
        margin,
        padding,
      },
    );
  }, [
    matchingScreen,
    action,
    screenContext,
    openModal,
    maskClosable,
    position,
    height,
    width,
    margin,
    padding,
  ]);

  return { callback };
};
