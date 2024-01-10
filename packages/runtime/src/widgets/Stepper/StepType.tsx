import React from "react";
import type { EnsembleWidget } from "@ensembleui/react-framework";
import {
  CustomScopeProvider,
  useCustomScope,
} from "@ensembleui/react-framework";
import { EnsembleRuntime } from "../../runtime";

export interface StepTypeProps {
  scopeName?: string;
  data: unknown;
  template: EnsembleWidget;
  name: string;
  stateData: {
    active?: boolean;
    completed?: boolean;
    stepsLength?: number;
    index?: number;
  };
}
export const StepType: React.FC<StepTypeProps> = ({
  data,
  template,
  stateData,
  name,
}) => {
  const newData = data as Record<string, unknown>; // Assuming data is an object
  const newStateData = {
    [name]: { ...stateData, ...(newData[name] as object) },
  };
  const scope = useCustomScope();
  return (
    <CustomScopeProvider value={{ ...newStateData, ...scope }}>
      {EnsembleRuntime.render([template])}
    </CustomScopeProvider>
  );
};
