import { Modal } from "antd";
import { createContext, useLayoutEffect, useState } from "react";
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

export const ModalWrapper: React.FC = () => {
  const [modalState, setModalState] = useState<{
    visible: boolean[];
    content: React.ReactNode[];
    options: ModalProps[];
    key: number[];
    isDialog: boolean[];
  }>({
    visible: [],
    content: [],
    options: [],
    key: [],
    isDialog: [],
  });
  const [modalDimensions, setModalDimensions] = useState<{
    modalWidth: number[];
    modalHeight: number[];
  }>({
    modalWidth: [],
    modalHeight: [],
  });
  const [isFullScreen, setIsFullScreen] = useState<boolean[]>([]);

  useLayoutEffect(() => {
    if (
      modalState.visible.length > 0 &&
      !isFullScreen[isFullScreen.length - 1]
    ) {
      const contentNode = last(document.querySelectorAll(".ant-modal-content"));
      setModalDimensions((oldModalDimensions) => {
        const newModalDimensions = { ...oldModalDimensions };
        newModalDimensions.modalWidth[
          newModalDimensions.modalWidth.length - 1
        ] = contentNode?.clientWidth || 0;
        newModalDimensions.modalHeight[
          newModalDimensions.modalHeight.length - 1
        ] = contentNode?.clientHeight || 0;
        return newModalDimensions;
      });
    }
  }, [modalState.visible, isFullScreen]);

  const openModal = (
    newContent: React.ReactNode,
    newOptions: ModalProps,
    isDialog = false,
  ): void => {
    if (!isDialog && modalState.visible.length > 0) {
      // hide the last modal
      setModalState((oldModalState) => {
        const newModalState = { ...oldModalState };
        newModalState.visible[newModalState.visible.length - 1] = false;
        return newModalState;
      });
    }

    // add a new modal to the end of the arrays
    setModalState((oldModalState) => ({
      visible: [...oldModalState.visible, true],
      content: [...oldModalState.content, newContent],
      options: [...oldModalState.options, newOptions],
      key: [
        ...oldModalState.key,
        oldModalState.key.length
          ? oldModalState.key[oldModalState.key.length - 1] + 1
          : 0,
      ],
      isDialog: [...oldModalState.isDialog, isDialog],
    }));

    setModalDimensions((oldModalDimensions) => ({
      modalWidth: [...oldModalDimensions.modalWidth, 0],
      modalHeight: [...oldModalDimensions.modalHeight, 0],
    }));

    setIsFullScreen((oldIsFullScreen) => [...oldIsFullScreen, false]);
  };

  const closeModal = (index?: number): void => {
    if (index) {
      modalState.options[index]?.onClose?.();
    }

    // remove the last modal from the arrays
    setModalState((oldModalState) => ({
      visible: oldModalState.visible.slice(0, -1),
      content: oldModalState.content.slice(0, -1),
      options: oldModalState.options.slice(0, -1),
      key: oldModalState.key.slice(0, -1),
      isDialog: oldModalState.isDialog.slice(0, -1),
    }));

    setModalDimensions((oldModalDimensions) => ({
      modalWidth: oldModalDimensions.modalWidth.slice(0, -1),
      modalHeight: oldModalDimensions.modalHeight.slice(0, -1),
    }));

    setIsFullScreen((oldIsFullScreen) => oldIsFullScreen.slice(0, -1));
  };

  const closeAllModals = (): void => {
    Object.values(modalState.options)
      .reverse()
      .forEach((options) => {
        options?.onClose?.();
      });

    // remove all modals from the arrays
    setModalState({
      visible: [],
      content: [],
      options: [],
      key: [],
      isDialog: [],
    });

    setModalDimensions({
      modalWidth: [],
      modalHeight: [],
    });

    setIsFullScreen([]);
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
                modalDimensions.modalWidth[index],
                modalDimensions.modalHeight[index],
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
            onClick={
              (): void =>
                setModalState((oldModalState) => {
                  const newModalState = { ...oldModalState };
                  newModalState.visible[index] = false;
                  return newModalState;
                })
              // setVisible((v) => v.map((f, i) => (i === index ? !f : f)))
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

      {modalState.visible.map((isVisible, index) =>
        isVisible
          ? createPortal(
              <>
                <style>
                  {" "}
                  {isFullScreen[index]
                    ? getFullScreenStyles(index)
                    : getPositionStyles(modalState.options[index], index)}
                </style>
                <style>
                  {getCustomStyles(modalState.options[index], index)}
                </style>
                <Modal
                  bodyStyle={{
                    height: endsWith(modalState.options[index]?.height, "%")
                      ? `clamp(0vh, ${parseInt(
                          modalState.options[index]?.height || "0",
                          10,
                        )}vh, 92vh`
                      : modalState.options[index]?.height,
                    overflowY: "auto",
                  }}
                  centered={!isFullScreen[index]}
                  className={`ensemble-modal-${index}`}
                  closable={false}
                  footer={null}
                  key={modalState.key[index]}
                  maskClosable={modalState.options[index]?.maskClosable}
                  onCancel={(): void => closeModal(index)}
                  open={modalState.visible[index]}
                  style={{
                    ...(modalState.options[index]?.position
                      ? { position: "absolute" }
                      : {}),
                    margin:
                      (!isFullScreen[index] &&
                        modalState.options[index]?.margin) ||
                      0,
                  }}
                  title={getTitleElement(modalState.options[index], index)}
                  width={modalState.options[index]?.width || "auto"}
                >
                  {modalState.content[index]}
                </Modal>
              </>,
              document.body,
            )
          : null,
      )}
    </ModalContext.Provider>
  );
};
