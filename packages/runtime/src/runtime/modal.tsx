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
  hideCloseIcon?: boolean;
  hideFullScreenIcon?: boolean;
  onClose?: () => void;
  position?: "top" | "right" | "bottom" | "left";
  height?: string;
  width?: string | number;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  horizontalOffset?: number;
  verticalOffset?: number;
  showShadow?: boolean;
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

  const closeModal = (): void => {
    setVisible(false);
    options?.onClose?.();
  };

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
    center: `
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
    `,
  };

  const positionStyles = `
    .ant-modal {
      ${options.position ? positionSelector[options.position] : ""}
      ${
        options?.horizontalOffset
          ? `left: ${(options.horizontalOffset * 100) / 2}% !important;`
          : ""
      }
      ${
        options?.verticalOffset
          ? `top: ${(options.verticalOffset * 100) / 2}% !important;`
          : ""
      }
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
      ${
        options?.backgroundColor
          ? `background-color: ${options.backgroundColor} !important;`
          : ""
      } 
      ${options?.showShadow === false ? "box-shadow: none !important;" : ""}
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

  const fullScreenIcon = isFullScreen ? (
    <CloseFullscreenIcon
      onClick={(): void => setIsFullScreen(false)}
      style={iconStyles}
    />
  ) : (
    <OpenInFullIcon
      onClick={(): void => setIsFullScreen(true)}
      style={iconStyles}
    />
  );

  const titleElement =
    !options?.title &&
    options?.hideFullScreenIcon === true &&
    options?.hideCloseIcon === true ? null : (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {options?.hideFullScreenIcon ? null : fullScreenIcon}
        {options.title}
        {options?.hideCloseIcon ? null : (
          <CloseOutlined
            onClick={(): void => setVisible(false)}
            style={iconStyles}
          />
        )}
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
                  overflowY: "auto",
                }}
                centered={!isFullScreen}
                closable={false}
                footer={null}
                key={key}
                maskClosable={options.maskClosable}
                onCancel={closeModal}
                open={visible}
                style={{
                  ...(options?.position ? { position: "absolute" } : {}),
                  margin: (!isFullScreen && options.margin) || 0,
                }}
                title={titleElement}
                width={options?.width || "auto"}
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
