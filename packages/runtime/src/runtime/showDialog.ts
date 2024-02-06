import {
  unwrapWidget,
  type EnsembleWidget,
  type ShowDialogAction,
  type ShowDialogOptions,
} from "@ensembleui/react-framework";
import { EnsembleRuntime } from "./runtime";
import { cloneDeep, isObject } from "lodash-es";

export type ShowDialogApiProps = {
  action?: ShowDialogAction;
  openModal?: (...args: any[]) => void;
};

export const showDialog = (props?: ShowDialogApiProps): void => {
  const { action, openModal } = props ?? {};
  if (!action || !openModal || !action?.widget) {
    return;
  }

  const widget = action?.widget?.name
    ? (cloneDeep(action?.widget) as unknown as EnsembleWidget)
    : unwrapWidget(cloneDeep(action?.widget));

  openModal?.(
    EnsembleRuntime.render([widget]),
    getShowDialogOptions(action?.options),
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
