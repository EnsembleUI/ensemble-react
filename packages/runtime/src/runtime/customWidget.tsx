import { CustomScopeProvider } from "@ensembleui/react-framework";
import type { CustomWidgetModel } from "@ensembleui/react-framework";
import React from "react";
import { EnsembleRuntime } from "./runtime";

export interface CustomWidgetProps {
  inputs: Record<string, unknown>;
}

export const createCustomWidget = (
  model: CustomWidgetModel,
): React.FC<CustomWidgetProps> => {
  const CustomWidget: React.FC<CustomWidgetProps> = ({ inputs }) => {
    return (
      <CustomScopeProvider value={inputs}>
        {EnsembleRuntime.render([model.body])}
      </CustomScopeProvider>
    );
  };
  return CustomWidget;
};
