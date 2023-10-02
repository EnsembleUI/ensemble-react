import { useApplicationContext } from "framework";
import { EnsembleScreen } from "./screen";
import { Modal } from "antd";
import { useState } from "react";
import { EnsembleRuntime } from "./runtime";
import { navigateModalScreenProps } from "../util/types";

const navigateModalScreen = (
  isModalVisible: boolean,
  onCancel: () => void,
  props?: string | navigateModalScreenProps
) => {
  const app = useApplicationContext();

  const screenName = typeof props === "string" ? props : props?.name;
  const maskClosable = typeof props === "string" ? true : props?.maskClosable;

  const screen = app?.application?.screens.find(
    (s) => s.name.toLowerCase() === screenName?.toLowerCase()
  );
  const title = screen?.header && EnsembleRuntime.render([screen.header]);

  const renderModal = screen ? (
    <Modal
      open={isModalVisible}
      onCancel={onCancel}
      title={title}
      footer={null}
      centered
      maskClosable={maskClosable}
    >
      <EnsembleScreen screen={screen} />
    </Modal>
  ) : null;

  return {
    renderModal,
  };
};

export const useNavigateModalScreen = (
  props?: string | navigateModalScreenProps
) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onCancel = () => setIsModalVisible(false);
  const openModal = () => setIsModalVisible(true);

  const { renderModal } = navigateModalScreen(isModalVisible, onCancel, props);

  return {
    openModal,
    renderModal,
  };
};
