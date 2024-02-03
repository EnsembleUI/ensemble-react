import {
  unwrapWidget,
  type EnsembleWidget,
  type ShowDialogAction,
  ShowDialogOptions,
} from "@ensembleui/react-framework";
import { EnsembleRuntime } from "./runtime";
import { cloneDeep, findKey, get, isObject, set } from "lodash-es";

export type ShowDialogApiProps = {
  action?: ShowDialogAction;
  openModal?: (...args: any[]) => void;
};

export const showDialog = (props?: ShowDialogApiProps): void => {
  const { action, openModal } = props ?? {};
  if (!action || !openModal || !action?.widget) {
    return;
  }

  const widget = action?.widget;
  const widgetKey = findKey(widget, isObject) || "";
  let inlineWidget: EnsembleWidget | undefined;

  if ((get(widget, widgetKey) as Record<string, unknown>)?.inputs) {
    set(widget, "name", widgetKey);
    set(widget, "properties", get(widget, widgetKey));
  } else if (!widget?.name) {
    inlineWidget = cloneDeep(unwrapWidget(action?.widget));
  }

  const content = inlineWidget
    ? EnsembleRuntime.render([inlineWidget])
    : EnsembleRuntime.render([widget as unknown as EnsembleWidget]);

  openModal?.(
    content,
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
