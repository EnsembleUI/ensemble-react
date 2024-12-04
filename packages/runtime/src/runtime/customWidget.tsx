import {
  CustomScopeProvider,
  CustomEventScopeProvider,
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
  events: { [key: string]: unknown };
}

export const createCustomWidget = (
  widget: CustomWidgetModel,
): React.FC<CustomWidgetProps> => {
  const tempVar = widget.inputs.reduce<{ [key: string]: undefined }>(
    (acc, item: string) => {
      acc[item] = undefined;
      return acc;
    },
    {},
  );

  const CustomWidget: React.FC<CustomWidgetProps> = ({ inputs, events }) => {
    const { values } = useRegisterBindings<{ [key: string]: unknown }>({
      ...tempVar,
      ...inputs,
      widgetName: widget.name,
    });

    return (
      <CustomEventScopeProvider value={events}>
        <CustomScopeProvider value={values ?? inputs}>
          <OnLoadAction action={widget.onLoad} context={values ?? inputs}>
            {EnsembleRuntime.render([widget.body])}
          </OnLoadAction>
        </CustomScopeProvider>
      </CustomEventScopeProvider>
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
  }, [context, isComplete, onLoadAction?.callback]);

  return <>{children}</>;
};
