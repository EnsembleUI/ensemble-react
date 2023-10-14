import type { NavigateModalScreenAction } from "framework";
import { useApplicationContext } from "framework";
import { useCallback, useContext, useMemo } from "react";
// FIXME
// eslint-disable-next-line import/no-cycle
import { EnsembleScreen } from "../screen";
import { EnsembleRuntime } from "../runtime";
import { ModalContext } from "../modal";
import type {
  EnsembleActionHook,
  EnsembleActionHookResult,
} from "./useEnsembleAction";

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction,
  null,
  EnsembleActionHookResult
> = (action?: NavigateModalScreenAction) => {
  const { setVisible, setContent, setOptions } = useContext(ModalContext);
  const app = useApplicationContext();

  const screenName = typeof action === "string" ? action : action?.name;
  const maskClosable =
    typeof action === "string" || action?.maskClosable === undefined
      ? true
      : Boolean(action?.maskClosable);

  const { screen, title } = useMemo(() => {
    const matchingScreen = app?.application?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase(),
    );
    const titleElement = matchingScreen?.header
      ? EnsembleRuntime.render([matchingScreen.header])
      : null;
    return { screen: matchingScreen, title: titleElement };
  }, [app, screenName]);

  const openModal = useCallback(() => {
    if (screen) {
      setVisible(true);
      setContent(<EnsembleScreen screen={screen} />);
      setOptions({
        title,
        maskClosable,
      });
    }
  }, [screen, title, maskClosable]);

  return { callback: openModal };
};
