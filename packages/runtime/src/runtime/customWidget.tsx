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
import { isEmpty, some, includes } from "lodash-es";
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
          <OnLoadAction
            action={widget.onLoad}
            context={values ?? inputs}
            rawInputs={inputs}
          >
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
    rawInputs: { [key: string]: unknown };
  }>
> = ({ action, children, context, rawInputs }) => {
  const onLoadAction = useEnsembleAction(action);
  const [isComplete, setIsComplete] = useState(false);
  // check if any inputs are bound to storage
  const [areInputBindingsReady, setAreInputBindingsReady] = useState(
    isEmpty(rawInputs) ||
      !some(
        rawInputs,
        (input) =>
          typeof input === "string" && includes(input, "ensemble.storage.get"),
      ),
  );

  // wait for binding evaluation to complete on next tick
  useEffect(() => {
    if (areInputBindingsReady) {
      return;
    }
    const timer = setTimeout(() => {
      setAreInputBindingsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [areInputBindingsReady]);

  useEffect(() => {
    if (!onLoadAction?.callback || isComplete || !areInputBindingsReady) {
      return;
    }
    try {
      onLoadAction.callback(context);
    } catch (e) {
      error(e);
    } finally {
      setIsComplete(true);
    }
  }, [context, isComplete, areInputBindingsReady, onLoadAction?.callback]);

  // don't render children until onLoad completes to prevent flash of unwanted content
  // this ensures that if onLoad sets initial state (like hiding/showing elements),
  // users won't see a brief flash of the default state before the onLoad logic runs
  if (!isComplete && action) {
    return null;
  }

  return <>{children}</>;
};
