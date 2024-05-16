import { useRegisterBindings } from "@ensembleui/react-framework";
import { type EnsembleWidgetProps } from "../shared/types";
import { WidgetRegistry } from "../registry";

const widgetName = "Spacer";

export type SpacerProps = {
  styles: {
    size?: number;
  };
} & EnsembleWidgetProps;

export const Spacer: React.FC<SpacerProps> = (props) => {
  const { values } = useRegisterBindings({ ...props, widgetName }, props.id);
  return (
    <div
      style={{
        height: values?.styles?.size ?? 5,
        width: values?.styles?.size ?? 5,
      }}
    />
  );
};

WidgetRegistry.register(widgetName, Spacer);
