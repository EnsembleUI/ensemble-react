import type { CustomScope } from "@ensembleui/react-framework";
import { CustomScopeProvider } from "@ensembleui/react-framework";
import { EnsembleRuntime } from "../../runtime";
import type { StepTemplate } from "./Stepper";

export interface StepTypeProps {
  scopeName?: string;
  data: unknown;
  template: StepTemplate;
  stepIndex: number;
}
export const StepType: React.FC<StepTypeProps> = ({
  data,
  template,
  stepIndex,
}) => {
  const stepTemplate = template.properties.children[stepIndex];
  return (
    <CustomScopeProvider value={data as CustomScope}>
      {EnsembleRuntime.render([stepTemplate])}
    </CustomScopeProvider>
  );
};
