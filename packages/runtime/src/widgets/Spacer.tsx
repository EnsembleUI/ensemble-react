import { EnsembleWidgetProps } from "../shared/types";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";

export type SpacerProps = {
  styles: {
    size?: number;
  };
} & EnsembleWidgetProps;

export const Spacer: React.FC<SpacerProps> = (props) => {
  const { values } = useRegisterBindings({ ...props }, props.id);
  return (
    <div
      style={{
        height: values?.styles?.size ?? 5,
        width: values?.styles?.size ?? 5,
      }}
    />
  );
};

WidgetRegistry.register("Spacer", Spacer);
