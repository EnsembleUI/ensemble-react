import { Modal } from "antd";
import type { NavigateModalScreenAction } from "framework";
import { createContext, useState } from "react";
import { createPortal } from "react-dom";
import { Outlet } from "react-router-dom";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

type ModalProps = {
  title?: string | React.ReactNode;
} & Omit<Exclude<NavigateModalScreenAction, string>, "name">;

interface ModalContextProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  content: React.ReactNode;
  setContent: (content: React.ReactNode) => void;
  options: ModalProps;
  setOptions: (options: ModalProps) => void;
}

export const ModalContext = createContext<ModalContextProps>({
  visible: false,
  setVisible: () => {},
  content: null,
  setContent: () => {},
  options: {},
  setOptions: () => {},
});

export const ModalWrapper: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [options, setOptions] = useState<ModalProps>({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  const customStyles = `
    .ant-modal-content {
      padding: 10px 24px !important;
    }
  `;

  const fullScreenStyles = `
    .ant-modal, .ant-modal-content {
      height: 100vh;
      width: 100vw;
      margin: 0;
      top: 0;
    }
    .ant-modal-body {
      height: calc(100vh - 110px);
    }
  `;

  const titleElement = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {isFullScreen ? (
        <CloseFullscreenIcon
          onClick={() => setIsFullScreen(false)}
          style={{
            color: "rgba(0, 0, 0, 0.45)",
            cursor: "pointer",
          }}
        />
      ) : (
        <OpenInFullIcon
          onClick={() => setIsFullScreen(true)}
          style={{
            color: "rgba(0, 0, 0, 0.45)",
            cursor: "pointer",
          }}
        />
      )}
      {options?.title}
    </div>
  );

  return (
    <ModalContext.Provider
      value={{ visible, setVisible, content, setContent, options, setOptions }}
    >
      <Outlet />

      {visible &&
        createPortal(
          <>
            <style> {isFullScreen && fullScreenStyles}</style>
            <style>{customStyles}</style>
            <Modal
              open={visible}
              onCancel={() => setVisible(false)}
              title={titleElement}
              centered={!isFullScreen}
              maskClosable={options?.maskClosable}
              footer={null}
              bodyStyle={{
                margin: 0,
                padding: 0,
              }}
            >
              {content}
            </Modal>
          </>,
          document.body,
        )}
    </ModalContext.Provider>
  );
};
