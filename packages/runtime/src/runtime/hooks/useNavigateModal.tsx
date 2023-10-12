import type { NavigateModalScreenAction } from "framework";
import { useApplicationContext } from "framework";
import type { ReactNode } from "react";
// FIXME
// eslint-disable-next-line import/no-cycle
import { EnsembleScreen } from "../screen";
import { EnsembleRuntime } from "../runtime";
import type {
  EnsembleActionHook,
  EnsembleActionHookResult,
} from "./useEnsembleAction";
import { GlobalModal } from "react-global-modal-plus";

export type UseNavigateModalScreenResult =
  | ({
      openModal: () => void;
      Modal: ReactNode;
    } & EnsembleActionHookResult)
  | undefined;

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction,
  null,
  EnsembleActionHookResult
> = (action?: NavigateModalScreenAction) => {
  const screenName = typeof action === "string" ? action : action?.name;
  const app = useApplicationContext();

  const openModal = (): void => {
    const matchingScreen = app?.application?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase(),
    );

    if (matchingScreen) {
      const titleElement = matchingScreen?.header
        ? EnsembleRuntime.render([matchingScreen.header])
        : null;
      const maskClosable =
        typeof action === "string" || !action?.maskClosable
          ? true
          : Boolean(action?.maskClosable);

      GlobalModal.popAndPush({
        component: () => <EnsembleScreen screen={matchingScreen} />,
        titleComponent: titleElement,
        maskClosable: maskClosable,
      });
    }
  };

  return {
    callback: openModal,
  };
};
