import {
  CustomScopeProvider,
  error,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import type {
  CustomWidgetModel,
  EnsembleAction,
} from "@ensembleui/react-framework";
import React, { useEffect, useRef, useState } from "react";
import { EnsembleRuntime } from "./runtime";
import { useEnsembleAction } from "./hooks/useEnsembleAction";

export interface CustomWidgetProps {
  inputs: Record<string, unknown>;
}

export const createCustomWidget = (
  widget: CustomWidgetModel,
): React.FC<CustomWidgetProps> => {
  const CustomWidget: React.FC<CustomWidgetProps> = ({ inputs }) => {
    const { values } = useRegisterBindings<Record<string, unknown>>({
      ...inputs,
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
    context: Record<string, unknown>;
  }>
> = ({ action, children, context }) => {
  const onLoadActionRef = useRef(useEnsembleAction(action));
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!onLoadActionRef.current?.callback || isComplete) {
      return;
    }
    try {
      onLoadActionRef.current.callback(context);
    } catch (e) {
      error(e);
    } finally {
      setIsComplete(true);
    }
  }, [context, isComplete, onLoadActionRef.current]);

  return <>{children}</>;
};
