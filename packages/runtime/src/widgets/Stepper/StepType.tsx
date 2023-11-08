import type { CustomScope, EnsembleWidget } from "@ensembleui/react-framework";
import { CustomScopeProvider } from "@ensembleui/react-framework";
import { EnsembleRuntime } from "../../runtime";

export interface StepTypeProps {
  scopeName?: string;
  data: unknown;
  template: EnsembleWidget;
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
}) => {
  const newData: CustomScope = { ...(data as object), ...stateData };
  return (
    <CustomScopeProvider value={newData}>
      {EnsembleRuntime.render([template])}
    </CustomScopeProvider>
  );
};
