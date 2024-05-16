import {
  useRegisterBindings,
  type Expression,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../shared/types";

const widgetName = "Divider";

export interface DividerStyles extends EnsembleWidgetStyles {
  direction?: "horizontal" | "vertical";
  thickness?: number;
  endIndent?: string | number;
  indent?: string | number;
  color?: Expression<string>;
  width?: string;
}

export type DividerProps = EnsembleWidgetProps<DividerStyles>;

export const DividerWidget: React.FC<DividerProps> = (props) => {
  const { values } = useRegisterBindings({ ...props, widgetName }, props.id);
  const { direction, ...restStyles } = values?.styles || {};

  let width;
  if (direction === "vertical") {
    width = "0px";
  } else if (values?.styles?.width) {
    width = values.styles.width;
  } else {
    width = "100%";
  }

  return (
    <div
      className={restStyles.names}
      style={{
        border: `${
          values?.styles?.thickness ? `${values.styles.thickness}px` : "1px"
        } solid ${values?.styles?.color ?? "black"}`,
        margin: `${
          values?.styles?.margin ? `${values.styles.margin}px 0px` : "10px 0px"
        }`,
        padding: `${
          values?.styles?.indent && values.styles.endIndent
            ? `0px ${values.styles.endIndent}px 0px ${values.styles.indent}px`
            : "0px"
        }`,
        width,
        ...restStyles,
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
      }}
    />
  );
};

WidgetRegistry.register(widgetName, DividerWidget);
