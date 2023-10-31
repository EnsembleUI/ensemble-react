import type { NavigateModalScreenAction } from "@ensembleui/react-framework";
import { useApplicationContext } from "@ensembleui/react-framework";
import { isString } from "lodash-es";
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
  const app = useApplicationContext();

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

  const { screen } = useMemo(() => {
    const matchingScreen = app?.application?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase(),
    );
    return { screen: matchingScreen };
  }, [app, screenName]);

  const callback = useCallback(() => {
    if (screen) {
      openModal?.(<EnsembleScreen screen={screen} />, {
        maskClosable,
        position,
        height,
        width,
        margin,
        padding,
      });
    }
  }, [
    screen,
    openModal,
    isStringAction,
    action,
    maskClosable,
    position,
    height,
    width,
    margin,
    padding,
  ]);

  return { callback };
};
