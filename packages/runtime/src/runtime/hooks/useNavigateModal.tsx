import type { NavigateModalScreenAction } from "framework";
import { useApplicationContext } from "framework";
import { useCallback, useContext, useMemo } from "react";
// FIXME
// eslint-disable-next-line import/no-cycle
import { EnsembleScreen } from "../screen";
import { EnsembleRuntime } from "../runtime";
import { ModalContext } from "../modal";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction
> = (action?: NavigateModalScreenAction) => {
  const { openModal } = useContext(ModalContext) || {};
  const app = useApplicationContext();

  const screenName = typeof action === "string" ? action : action?.name;
  const maskClosable =
    typeof action === "string" || action?.maskClosable === undefined
      ? true
      : Boolean(action.maskClosable);
  const position =
    typeof action !== "string" ? action?.styles?.position : undefined;
  const height =
    typeof action !== "string" ? action?.styles?.height : undefined;
  const width = typeof action !== "string" ? action?.styles?.width : undefined;
  const margin =
    typeof action !== "string" ? action?.styles?.margin : undefined;
  const padding =
    typeof action !== "string" ? action?.styles?.padding : undefined;

  const { screen, title } = useMemo(() => {
    const matchingScreen = app?.application?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase(),
    );
    const titleElement = matchingScreen?.header
      ? EnsembleRuntime.render([matchingScreen.header])
      : null;
    return { screen: matchingScreen, title: titleElement };
  }, [app, screenName]);

  const callback = useCallback(() => {
    if (screen)
      openModal?.(<EnsembleScreen screen={screen} />, {
        title,
        maskClosable,
        position,
        height,
        width,
        margin,
        padding,
      });
  }, [
    openModal,
    screen,
    title,
    maskClosable,
    position,
    height,
    width,
    margin,
    padding,
  ]);

  return { callback };
};
