import {
  CustomScopeProvider,
  unwrapWidget,
  type CustomScope,
  type EnsembleWidget,
  type ShowDialogAction,
} from "@ensembleui/react-framework";
import { EnsembleRuntime } from "./runtime";
import { cloneDeep, findKey, get, isObject, isString } from "lodash-es";
import { ReactElement } from "react";
import { WidgetRegistry } from "../registry";

export type ShowDialogApiProps = {
  action?: ShowDialogAction;
  openModal?: (...args: any[]) => void;
};

export const showDialog = (props?: ShowDialogApiProps): void => {
  const { action, openModal } = props ?? {};
  if (!action || !openModal || !action?.widget) {
    return;
  }

  const modalOptions = {
    maskClosable: true,
    hideCloseIcon: true,
    hideFullScreenIcon: true,
    verticalOffset: action?.options?.verticalOffset,
    horizontalOffset: action?.options?.horizontalOffset,
    padding: "12px",
    ...(action?.options?.style === "none"
      ? {
          backgroundColor: "transparent",
          showShadow: false,
        }
      : {}),
    ...(isObject(action.options) ? action.options : {}),
  };

  const widget = action?.widget;
  const widgetKey = findKey(widget, isObject);
  const widgetInputs = (get(widget, widgetKey || "") as Record<string, unknown>)
    ?.inputs;
  let inlineWidget: EnsembleWidget | undefined;
  let customWidget: React.FC | ReactElement | undefined;

  if (isString(widget?.name)) {
    customWidget = WidgetRegistry.find(widget?.name);
  } else if (widgetInputs !== undefined) {
    customWidget = WidgetRegistry.find(widgetKey || "");
  } else {
    inlineWidget = cloneDeep(unwrapWidget(action?.widget));
  }

  const WidgetFn = customWidget as React.FC<unknown>;

  const content = (
    <CustomScopeProvider
      value={{
        ...(widgetInputs as CustomScope),
        ...(widget?.inputs as CustomScope),
      }}
    >
      {customWidget ? (
        <WidgetFn />
      ) : (
        EnsembleRuntime.render([inlineWidget as EnsembleWidget])
      )}
    </CustomScopeProvider>
  );

  openModal?.(content, modalOptions, true, screen || undefined);
};
