import { Modal } from "antd";
import { createContext, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Outlet } from "react-router-dom";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { endsWith } from "lodash-es";
import { CloseOutlined } from "@ant-design/icons";

interface ModalProps {
  title?: string | React.ReactNode;
  maskClosable?: boolean;
  position?: "top" | "right" | "bottom" | "left";
  height?: string;
  width?: string;
  margin?: string;
  padding?: string;
}

interface ModalContextProps {
  openModal: (content: React.ReactNode, options: ModalProps) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(
  undefined,
);

export const ModalWrapper: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [options, setOptions] = useState<ModalProps>({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [modalWidth, setModalWidth] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);
  const [key, setKey] = useState(0);

  useLayoutEffect(() => {
    if (visible && !isFullScreen) {
      const contentNode = document.querySelector(".ant-modal-content");
      setModalWidth(contentNode?.clientWidth || 0);
      setModalHeight(contentNode?.clientHeight || 0);
    }
  }, [visible, isFullScreen, content]);

  const openModal = (
    newContent: React.ReactNode,
    newOptions: ModalProps,
  ): void => {
    setKey((prevKey) => prevKey + 1);
    setContent(newContent);
    setOptions(newOptions);
    setVisible(true);
  };

  const closeModal = (): void => setVisible(false);

  const positionSelector = {
    top: `
      top: 0 !important;
      left: calc(50% - ${modalWidth / 2}px) !important;
    `,
    right: `
      right: 0 !important;
      top: calc(50% - ${modalHeight / 2}px) !important;
    `,
    bottom: `
      bottom: 0 !important;
      right: calc(50% - ${modalWidth / 2}px) !important;
    `,
    left: `
      left: 0 !important;
      top: calc(50% - ${modalHeight / 2}px) !important;
    `,
  };

  const positionStyles = `
    .ant-modal {
      ${options.position ? positionSelector[options.position] : ""}
    }
  `;

  const customStyles = `
    .ant-modal-root .ant-modal-centered .ant-modal {
      top: unset;
    }
    .ant-modal-content {
      padding: ${
        options.padding ? options.padding : "10px 24px 24px"
      } !important;
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

  const iconStyles = {
    color: "rgba(0, 0, 0, 0.45)",
    cursor: "pointer",
  };

  const titleElement = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {isFullScreen ? (
        <CloseFullscreenIcon
          onClick={(): void => setIsFullScreen(false)}
          style={iconStyles}
        />
      ) : (
        <OpenInFullIcon
          onClick={(): void => setIsFullScreen(true)}
          style={iconStyles}
        />
      )}
      {options.title}
      <CloseOutlined
        onClick={(): void => setVisible(false)}
        style={iconStyles}
      />
    </div>
  );

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
      }}
    >
      <Outlet />

      {visible
        ? createPortal(
            <>
              <style> {isFullScreen ? fullScreenStyles : positionStyles}</style>
              <style>{customStyles}</style>
              <Modal
                bodyStyle={{
                  height: endsWith(options.height, "%")
                    ? `clamp(0vh, ${parseInt(options.height!, 10)}vh, 92vh`
                    : options.height,
                }}
                centered={!isFullScreen}
                closable={false}
                footer={null}
                key={key}
                maskClosable={options.maskClosable}
                open={visible}
                style={{
                  position: options.position ? "absolute" : "unset",
                  margin: options.margin || 0,
                }}
                title={titleElement}
                width={options.width}
              >
                {content}
              </Modal>
            </>,
            document.body,
          )
        : null}
    </ModalContext.Provider>
  );
};
