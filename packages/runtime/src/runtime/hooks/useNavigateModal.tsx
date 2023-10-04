import type { NavigateModalScreenAction } from "framework";
import { useApplicationContext } from "framework";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Modal } from "antd";
import { EnsembleScreen } from "../screen";
import { EnsembleRuntime } from "../runtime";
import type {
  EnsembleActionHook,
  EnsembleActionHookResult,
} from "./useEnsembleAction";

export type UseNavigateModalScreenResult = {
  openModal: () => void;
  Modal: ReactNode;
} & EnsembleActionHookResult;

export const useNavigateModalScreen: EnsembleActionHook<
  NavigateModalScreenAction,
  null,
  UseNavigateModalScreenResult
> = (action?: NavigateModalScreenAction) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onCancel = (): void => setIsModalVisible(false);
  const openModal = (): void => setIsModalVisible(true);

  const app = useApplicationContext();

  const screenName = typeof action === "string" ? action : action?.name;
  const maskClosable =
    typeof action === "string" ? true : Boolean(action?.maskClosable);

  const { screen, title } = useMemo(() => {
    const matchingScreen = app?.application?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase(),
    );
    const titleElement = matchingScreen?.header
      ? EnsembleRuntime.render([matchingScreen.header])
      : null;
    return { screen: matchingScreen, title: titleElement };
  }, [app, screenName]);

  const ModalElement = screen ? (
    <Modal
      centered
      footer={null}
      maskClosable={maskClosable}
      onCancel={onCancel}
      open={isModalVisible}
      title={title}
    >
      <EnsembleScreen screen={screen} />
    </Modal>
  ) : null;

  return {
    openModal,
    Modal: ModalElement,
  };
};
