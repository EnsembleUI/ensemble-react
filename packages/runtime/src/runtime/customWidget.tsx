import {
  CustomScopeProvider,
  error,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import type {
  CustomWidgetModel,
  EnsembleAction,
} from "@ensembleui/react-framework";
import React, { useEffect, useState } from "react";
import { EnsembleRuntime } from "./runtime";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";

export interface CustomWidgetProps {
  inputs: { [key: string]: unknown };
}

export const createCustomWidget = (
  widget: CustomWidgetModel,
): React.FC<CustomWidgetProps> => {
  const CustomWidget: React.FC<CustomWidgetProps> = ({ inputs }) => {
    const { values } = useRegisterBindings<{ [key: string]: unknown }>({
      ...inputs,
      widgetName: widget.name,
    });

    return (
      <CustomScopeProvider value={values ?? inputs}>
        <OnLoadAction action={widget?.onLoad} context={values ?? inputs}>
          {EnsembleRuntime.render([widget.body])}
        </OnLoadAction>
      </CustomScopeProvider>
    );
  };
  return CustomWidget;
};

const OnLoadAction: React.FC<
  React.PropsWithChildren<{
    action?: EnsembleAction;
    context: { [key: string]: unknown };
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
