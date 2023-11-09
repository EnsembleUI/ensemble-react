import type { EnsembleWidget } from "@ensembleui/react-framework";
import { CustomScopeProvider } from "@ensembleui/react-framework";
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
  return (
    <CustomScopeProvider value={newStateData}>
      {EnsembleRuntime.render([template])}
    </CustomScopeProvider>
  );
};
