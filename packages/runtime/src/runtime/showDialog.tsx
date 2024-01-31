import {
  type CustomScope,
  CustomScopeProvider,
  type EnsembleAction,
  type EnsembleWidget,
  type ShowDialogAction,
  error,
} from "@ensembleui/react-framework";
import { EnsembleRuntime } from "./runtime";
import { isObject, merge } from "lodash-es";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";
import { useEffect, useState } from "react";

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
  };
  if (isObject(action.options)) {
    merge(modalOptions, action.options);
  }

  const widget = (
    <CustomScopeProvider value={action?.widget?.inputs as CustomScope}>
      <OnLoadAction
        action={action?.widget?.onLoad as EnsembleAction | undefined}
        context={action?.widget?.inputs as Record<string, unknown>}
      >
        {EnsembleRuntime.render([action?.widget?.body as EnsembleWidget])}
      </OnLoadAction>
    </CustomScopeProvider>
  );

  openModal?.(widget, modalOptions, true, screen || undefined);
};

const OnLoadAction: React.FC<
  React.PropsWithChildren<{
    action?: EnsembleAction;
    context: Record<string, unknown>;
  }>
> = ({ action, children, context }) => {
  const onLoadAction = useEnsembleAction(action);
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    if (!onLoadAction?.callback || isComplete) {
      return;
    }
    try {
      onLoadAction.callback(context);
    } catch (e) {
      error(e);
    } finally {
      setIsComplete(true);
    }
  }, [context, isComplete, onLoadAction, onLoadAction?.callback]);

  return <>{children}</>;
};
