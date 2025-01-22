import { Modal } from "antd";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import { generateRandomString, useEvaluate } from "@ensembleui/react-framework";
import { isString, omit, pick } from "lodash-es";
import { useNavigate } from "react-router-dom";
import { getComponentStyles } from "../../shared/styles";
import { getCustomStyles, getFullScreenStyles } from "./utils";

export interface ModalProps {
  title?: string | React.ReactNode;
  maskClosable?: boolean;
  mask?: boolean;
  hideCloseIcon?: boolean;
  hideFullScreenIcon?: boolean;
  onClose?: () => void;
  position?: "top" | "right" | "bottom" | "left" | "center";
  height?: string;
  width?: string | number;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  horizontalOffset?: number;
  verticalOffset?: number;
  showShadow?: boolean;
}

export interface ModalContextProps {
  openModal: (
    content: React.ReactNode,
    options: ModalProps,
    isDialog?: boolean,
    context?: { [key: string]: unknown },
  ) => void;
  closeAllModals: () => void;
  navigateBack: () => void;
  closeAllScreens: () => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(
  undefined,
);

interface ModalState {
  visible: boolean;
  content: React.ReactNode;
  options: ModalProps;
  key: string;
  isDialog: boolean;
}

interface ModalDimensions {
  width: number;
  height: number;
}

const iconStyles = {
  color: "rgba(0, 0, 0, 0.45)",
  cursor: "pointer",
};

export const ModalWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState[]>([]);
  const [modalDimensions, setModalDimensions] = useState<ModalDimensions[]>([]);
  const [isFullScreen, setIsFullScreen] = useState<boolean[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [nextModal, setNextModal] = useState<{
    content: React.ReactNode;
    options: ModalProps;
    isDialog: boolean;
    key: string;
    context?: { [key: string]: unknown };
  }>();
  const evaluatedOptions = useEvaluate(
    nextModal
      ? {
          key: nextModal.key,
          options: nextModal.options as { [key: string]: unknown },
        }
      : undefined,
    {
      context: nextModal?.context,
      refreshExpressions: true,
    },
  );

  const parentModalContext = useContext(ModalContext);
  const [shouldCloseAllModals, setShouldCloseAllModals] =
    useState<boolean>(false);
  const [shouldNavigateBack, setShouldNavigateBack] = useState<boolean>(false);
  const navigate = useNavigate();

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

  // add a new modal
  useEffect(() => {
    if (!nextModal || evaluatedOptions.key !== nextModal.key) {
      return;
    }

    // add a new modal to the end of the arrays
    setModalState((oldModalState) => {
      const nextModalState = {
        visible: true,
        content: nextModal.content,
        options: evaluatedOptions.options,
        key: nextModal.key,
        isDialog: Boolean(nextModal.isDialog),
      };
      const prevModalStateIndex = modalState.findIndex(
        (modal) => modal.key === nextModal.key,
      );
      if (prevModalStateIndex > -1) {
        oldModalState.splice(prevModalStateIndex, 1, nextModalState);
        return [...oldModalState];
      }
      return [...oldModalState, nextModalState];
    });

    setModalDimensions((oldModalDimensions) => [
      ...oldModalDimensions,
      { width: 0, height: 0 },
    ]);
    setIsFullScreen((oldIsFullScreen) => [...oldIsFullScreen, false]);
    setNextModal(undefined);
  }, [evaluatedOptions, modalState, nextModal]);

  const openModal = useCallback(
    (
      content: React.ReactNode,
      options: ModalProps,
      isDialog = false,
      modalContext?: { [key: string]: unknown },
    ): void => {
      setNextModal({
        content,
        options: omit(options, [!isString(options.title) ? "title" : ""]),
        isDialog,
        context: modalContext,
        key: generateRandomString(10),
      });
    },
    [],
  );

  const closeModal = useCallback(
    (index?: number): void => {
      if (index !== undefined) {
        modalState[index].options.onClose?.();
      }

      setModalState((oldModalState) =>
        oldModalState.filter((_, i) => i !== index),
      );
      setModalDimensions((oldModalDimensions) =>
        oldModalDimensions.filter((_, i) => i !== index),
      );
      setIsFullScreen((oldIsFullScreen) =>
        oldIsFullScreen.filter((_, i) => i !== index),
      );
    },
    [modalState],
  );

  useEffect(() => {
    if (!shouldCloseAllModals) {
      return;
    }
    for (let i = modalState.length - 1; i >= 0; i--) {
      if (!modalState[i].isDialog) break;
      else closeModal(i);
    }
    setShouldCloseAllModals(false);
  }, [closeModal, modalState, shouldCloseAllModals]);

  // Recursively check modal contexts if there is a modal
  // screen to close
  useEffect(() => {
    if (!shouldNavigateBack) {
      return;
    }
    const lastModalScreen = modalState
      .reverse()
      .find((modal) => !modal.isDialog);
    if (lastModalScreen) {
      closeModal(modalState.indexOf(lastModalScreen));
    } else if (parentModalContext) {
      parentModalContext.navigateBack();
    } else {
      navigate(-1);
    }
    setShouldNavigateBack(false);
  }, [
    closeModal,
    modalState,
    navigate,
    parentModalContext,
    shouldNavigateBack,
  ]);

  // Use async trigger so this callback doesn't need to
  // be updated each time modal states are changed
  const closeAllModals = useCallback((): void => {
    setShouldCloseAllModals(true);
  }, []);

  const navigateBack = useCallback((): void => {
    setShouldNavigateBack(true);
  }, []);

  // close all navigate modal screens
  const closeAllScreens = useCallback((): void => {
    const lastModalScreen = modalState
      .reverse()
      .find((modal) => !modal.isDialog);

    if (lastModalScreen) {
      closeModal(modalState.indexOf(lastModalScreen));
    }

    if (parentModalContext) {
      setShouldNavigateBack(true);
      parentModalContext.closeAllScreens();
    }
  }, []);

  const modalContext = useMemo(
    () => ({ openModal, closeAllModals, navigateBack, closeAllScreens }),
    [closeAllModals, openModal, navigateBack],
  );

  const getFullScreenIcon = (index: number): React.ReactNode =>
    isFullScreen[index] ? (
      <FullscreenExitOutlined
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
      <FullscreenOutlined
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
    !options.title &&
    options.hideFullScreenIcon === true &&
    options.hideCloseIcon === true ? null : (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {options.hideFullScreenIcon ? null : getFullScreenIcon(index)}
        {options.title}
        {options.hideCloseIcon ? null : (
          <CloseOutlined
            onClick={(): void => closeModal(index)}
            style={iconStyles}
          />
        )}
      </div>
    );

  return (
    <ModalContext.Provider value={modalContext}>
      {children}

      {modalState.map((modal, index) => {
        if (!modal.visible) {
          return null;
        }
        const { options, key } = modal;
        const modalContent = (
          <>
            <style>{getCustomStyles(options, key)}</style>
            {Boolean(isFullScreen[index]) && (
              <style>{getFullScreenStyles(key)}</style>
            )}
            <Modal
              centered={!isFullScreen[index]}
              className={`ensemble-modal-${key}`}
              closable={false}
              footer={null}
              key={modal.key}
              mask={options.mask}
              maskClosable={options.maskClosable}
              onCancel={(): void => closeModal(index)}
              open={modal.visible}
              style={{
                ...(options.position === "top" && {
                  top: 0,
                  left: `calc(50% - ${modalDimensions[index].width / 2}px)`,
                }),
                ...(options.position === "bottom" && {
                  bottom: 0,
                  left: `calc(50% - ${modalDimensions[index].width / 2}px)`,
                }),
                ...(options.position === "left" && {
                  left: 0,
                  top: `calc(50% - ${modalDimensions[index].height / 2}px)`,
                }),
                ...(options.position === "right" && {
                  right: 0,
                  top: `calc(50% - ${modalDimensions[index].height / 2}px)`,
                }),
                ...(options.position === "center" && {
                  top: "50% !important",
                  left: "50% !important",
                  transform: "translate(-50%, -50%) !important",
                }),
                ...(options.position && {
                  position: [
                    "top",
                    "right",
                    "bottom",
                    "left",
                    "center",
                  ].includes(options.position)
                    ? "absolute"
                    : (options.position as React.CSSProperties["position"]),
                }),
                ...(options.horizontalOffset && {
                  left: `calc(${(options.horizontalOffset * 100) / 2}% ${
                    options.horizontalOffset < 0 ? "+" : "-"
                  } ${modalDimensions[index].width / 2}px)`,
                }),
                ...(options.verticalOffset && {
                  top: `calc(${(options.verticalOffset * 100) / 2}% ${
                    options.verticalOffset < 0 ? "+" : "-"
                  } ${modalDimensions[index].height / 2}px)`,
                }),
                ...(isFullScreen[index]
                  ? {
                      height: "100vh",
                      width: "100vw",
                      margin: 0,
                      inset: 0,
                    }
                  : (getComponentStyles(
                      "",
                      pick(options, [
                        "height",
                        "width",
                        "top",
                        "right",
                        "bottom",
                        "left",
                      ]) as React.CSSProperties,
                      false,
                    ) as React.CSSProperties)),
              }}
              title={getTitleElement(modal.options, index)}
              width={modal.options.width || "auto"}
            >
              <div
                ref={contentRef}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {modal.content}
              </div>
            </Modal>
          </>
        );

        return createPortal(modalContent, document.body);
      })}
    </ModalContext.Provider>
  );
};
