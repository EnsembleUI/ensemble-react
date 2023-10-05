import { useApplicationContext, NavigateModalScreenProps } from "framework";
import { useMemo, useState } from "react";
import { EnsembleScreen } from "./screen";
import { EnsembleRuntime } from "./runtime";
import { Modal } from "antd";

const useNavigateModalScreen = (props?: string | NavigateModalScreenProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onCancel = () => setIsModalVisible(false);
  const openModal = () => setIsModalVisible(true);

  const app = useApplicationContext();

  const screenName = typeof props === "string" ? props : props?.name;
  const maskClosable = typeof props === "string" ? true : props?.maskClosable;

  const { screen, title } = useMemo(() => {
    const screen = app?.application?.screens.find(
      (s) => s.name.toLowerCase() === screenName?.toLowerCase()
    );
    const title = screen?.header && EnsembleRuntime.render([screen.header]);
    return { screen, title };
  }, [app, screenName]);

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
    openModal,
    renderModal,
  };
};

export default useNavigateModalScreen;
