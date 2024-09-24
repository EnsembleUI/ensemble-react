import { cloneDeep, isObject } from "lodash-es";
import type { ReactNode } from "react";
import { unwrapWidget } from "../parser";
import type {
  ShowDialogAction,
  EnsembleWidget,
  ShowDialogOptions,
} from "../shared";

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

export interface ModalContext {
  openModal: (
    content: React.ReactNode,
    options: ModalProps,
    isDialog?: boolean,
    context?: { [key: string]: unknown },
  ) => void;
  closeAllModals: () => void;
  navigateBack: () => void;
}

export interface ShowDialogApiProps {
  action?: ShowDialogAction;
  openModal?: (...args: any[]) => void;
  render?: (widgets: EnsembleWidget[]) => ReactNode[];
}

export const showDialog = (props?: ShowDialogApiProps): void => {
  const { action, openModal, render } = props ?? {};
  if (!action || !openModal || (!action.widget && !action.body)) {
    return;
  }

  const widget = action.widget ?? action.body;

  const content = widget?.name
    ? (cloneDeep(widget) as unknown as EnsembleWidget)
    : unwrapWidget(cloneDeep(widget!));

  openModal(
    render?.([content]),
    getShowDialogOptions(action.options),
    true,
    screen || undefined,
  );
};

export const getShowDialogOptions = (
  options?: ShowDialogOptions,
  onClose?: () => void,
): ShowDialogOptions => {
  const noneStyleOption = {
    backgroundColor: "transparent",
    showShadow: false,
  };

  const dialogOptions = {
    maskClosable: true,
    hideCloseIcon: true,
    hideFullScreenIcon: true,
    verticalOffset: options?.verticalOffset,
    horizontalOffset: options?.horizontalOffset,
    padding: "12px",
    onClose,
    ...(options?.style === "none" ? noneStyleOption : {}),
    ...(isObject(options) ? options : {}),
  };

  return dialogOptions;
};
