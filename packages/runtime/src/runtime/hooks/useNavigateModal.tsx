import type { NavigateModalScreenAction } from "@ensembleui/react-framework";
import { useApplicationContext } from "@ensembleui/react-framework";
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
      openModal?.(<EnsembleScreen screen={screen} />, { title, maskClosable });
  }, [openModal, screen, title, maskClosable]);

  return { callback };
};
