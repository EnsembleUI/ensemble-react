import {
  CustomScopeProvider,
  useCustomScope,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import type { CustomWidgetModel } from "@ensembleui/react-framework";
import React from "react";
import { EnsembleRuntime } from "./runtime";

export interface CustomWidgetProps {
  inputs: Record<string, unknown>;
}

export const createCustomWidget = (
  widget: CustomWidgetModel,
): React.FC<CustomWidgetProps> => {
  const CustomWidget: React.FC<CustomWidgetProps> = ({ inputs }) => {
    const parentScope = useCustomScope();
    const { values } = useRegisterBindings<Record<string, unknown>>({
      ...inputs,
    });
    return (
      <CustomScopeProvider value={{ ...parentScope, ...(values ?? inputs) }}>
        {EnsembleRuntime.render([widget.body])}
      </CustomScopeProvider>
    );
  };
  return CustomWidget;
};
