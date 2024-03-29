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
  if (!action || !openModal || (!action?.widget && !action?.body)) {
    return;
  }

  const widget = action?.widget ?? action?.body;

  const content = widget?.name
    ? (cloneDeep(widget) as unknown as EnsembleWidget)
    : // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      unwrapWidget(cloneDeep(widget!));

  openModal?.(
    EnsembleRuntime.render([content]),
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
