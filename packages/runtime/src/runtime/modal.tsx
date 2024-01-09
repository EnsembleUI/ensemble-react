import { Modal } from "antd";
import { createContext, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Outlet } from "react-router-dom";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { endsWith, last } from "lodash-es";
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
  openModal: (
    content: React.ReactNode,
    options: ModalProps,
    isDialog?: boolean,
  ) => void;
  closeAllModals: () => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(
  undefined,
);

interface ModalState {
  visible: boolean;
  content: React.ReactNode;
  options: ModalProps;
  key: number;
  isDialog: boolean;
}

interface ModalDimensions {
  width: number;
  height: number;
}

export const ModalWrapper: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState[]>([]);
  const [modalDimensions, setModalDimensions] = useState<ModalDimensions[]>([]);
  const [isFullScreen, setIsFullScreen] = useState<boolean[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (modalState.length > 0 && !isFullScreen[isFullScreen.length - 1])
      setModalDimensions((oldModalDimensions) => [
        ...oldModalDimensions.slice(0, -1),
        {
          width: contentRef.current?.offsetParent?.clientWidth || 0, // offsetParent is the .ant-modal-content
          height: contentRef.current?.offsetParent?.clientHeight || 0,
        },
      ]);
  }, [modalState, isFullScreen, contentRef]);

  const openModal = (
    newContent: React.ReactNode,
    newOptions: ModalProps,
    isDialog = false,
  ): void => {
    if (!isDialog && modalState.length > 0) {
      // hide the last modal
      setModalState((oldModalState) => [
        ...oldModalState.slice(0, -1),
        { ...oldModalState[oldModalState.length - 1], visible: false },
      ]);
    }

    // add a new modal to the end of the arrays
    setModalState((oldModalState) => [
      ...oldModalState,
      {
        visible: true,
        content: newContent,
        options: newOptions,
        key: oldModalState.length
          ? oldModalState[oldModalState.length - 1].key + 1
          : 0,
        isDialog,
      },
    ]);
    setModalDimensions((oldModalDimensions) => [
      ...oldModalDimensions,
      { width: 0, height: 0 },
    ]);

    setIsFullScreen((oldIsFullScreen) => [...oldIsFullScreen, false]);
  };

  const closeModal = (index?: number): void => {
    if (index) {
      modalState[index].options.onClose?.();
    }

    // remove the last modal from the arrays
    setModalState((oldModalState) => oldModalState.slice(0, -1));
    setModalDimensions((oldModalDimensions) => oldModalDimensions.slice(0, -1));
    setIsFullScreen((oldIsFullScreen) => oldIsFullScreen.slice(0, -1));
  };

  const closeAllModals = (): void => {
    for (let i = modalState.length - 1; i >= 0; i--) {
      if (!modalState[i].isDialog) break;
      else closeModal(i);
    }
  };

  const getPositionSelector = (
    modalWidth: number,
    modalHeight: number,
  ): Record<string, string> => {
    return {
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
  };

  const getPositionStyles = (options: ModalProps, index: number): string =>
    `
      .ensemble-modal-${index} {
        ${
          options.position
            ? getPositionSelector(
                modalDimensions[index].width,
                modalDimensions[index].height,
              )[options.position]
            : ""
        }
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

  const getCustomStyles = (options: ModalProps, index: number): string =>
    `
      .ant-modal-root .ant-modal-centered .ant-modal {
        top: unset;
      }
      .ensemble-modal-${index} .ant-modal-content {
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

  const getFullScreenStyles = (index: number): string => `
    .ensemble-modal-${index}.ant-modal, .ensemble-modal-${index}.ant-modal .ant-modal-content {
      height: 100vh;
      width: 100vw;
      margin: 0;
      top: 0;
    }
    .ensemble-modal-${index} .ant-modal-body {
      height: calc(100vh - 110px);
    }
  `;

  const iconStyles = {
    color: "rgba(0, 0, 0, 0.45)",
    cursor: "pointer",
  };

  const getFullScreenIcon = (index: number): React.ReactNode =>
    isFullScreen[index] ? (
      <CloseFullscreenIcon
        onClick={(): void =>
          setIsFullScreen((oldIsFullScreen) => {
            const newIsFullScreen = [...oldIsFullScreen];
            newIsFullScreen[index] = false;
            return newIsFullScreen;
          })
        }
        style={iconStyles}
      />
    ) : (
      <OpenInFullIcon
        onClick={(): void =>
          setIsFullScreen((oldIsFullScreen) => {
            const newIsFullScreen = [...oldIsFullScreen];
            newIsFullScreen[index] = true;
            return newIsFullScreen;
          })
        }
        style={iconStyles}
      />
    );

  const getTitleElement = (
    options: ModalProps,
    index: number,
  ): React.ReactNode =>
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
        {options?.hideFullScreenIcon ? null : getFullScreenIcon(index)}
        {options.title}
        {options?.hideCloseIcon ? null : (
          <CloseOutlined
            onClick={(): void =>
              setModalState((oldModalState) => [
                ...oldModalState.slice(0, -1),
                { ...oldModalState[oldModalState.length - 1], visible: false },
              ])
            }
            style={iconStyles}
          />
        )}
      </div>
    );

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeAllModals,
      }}
    >
      <Outlet />

      {modalState.map((modal, index) =>
        modal.visible
          ? createPortal(
              <>
                <style>
                  {" "}
                  {isFullScreen[index]
                    ? getFullScreenStyles(index)
                    : getPositionStyles(modal.options, index)}
                </style>
                <style>{getCustomStyles(modal.options, index)}</style>
                <>
                  <Modal
                    bodyStyle={{
                      height: endsWith(modal.options?.height, "%")
                        ? `clamp(0vh, ${parseInt(
                            modal.options?.height || "0",
                            10,
                          )}vh, 92vh`
                        : modal.options?.height,
                      overflowY: "auto",
                    }}
                    centered={!isFullScreen[index]}
                    className={`ensemble-modal-${index}`}
                    closable={false}
                    footer={null}
                    key={modal.key}
                    maskClosable={modal.options?.maskClosable}
                    onCancel={(): void => closeModal(index)}
                    open={modal.visible}
                    style={{
                      ...(modal.options?.position
                        ? { position: "absolute" }
                        : {}),
                      margin:
                        (!isFullScreen[index] && modal.options?.margin) || 0,
                    }}
                    title={getTitleElement(modal.options, index)}
                    width={modal.options?.width || "auto"}
                  >
                    <span ref={contentRef}>{modal.content}</span>
                  </Modal>
                </>
              </>,
              document.body,
            )
          : null,
      )}
    </ModalContext.Provider>
  );
};
