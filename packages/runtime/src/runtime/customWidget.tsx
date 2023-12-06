import {
  CustomScopeProvider,
  useRegisterBindings,
} from "@ensembleui/react-framework";
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
    const { values } = useRegisterBindings<Record<string, unknown>>({
      ...inputs,
    });
    return (
      <CustomScopeProvider value={values ?? inputs}>
        {EnsembleRuntime.render([model.body])}
      </CustomScopeProvider>
    );
  };
  return CustomWidget;
};
