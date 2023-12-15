import {
  useRegisterBindings,
  type Expression,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../shared/types";

export interface DividerStyles extends EnsembleWidgetStyles {
  direction?: "horizontal" | "vertical";
  thickness?: number;
  endIndent?: string | number;
  indent?: string | number;
  color?: Expression<string>;
}

export type DividerProps = EnsembleWidgetProps<DividerStyles>;

export const DividerWidget: React.FC<DividerProps> = (props) => {
  const { values } = useRegisterBindings({ ...props }, props.id);
  return (
    <div
      className="divider"
      style={{
        border: `${
          props.styles?.thickness ? `${props.styles.thickness}px` : "1px"
        } solid ${values?.styles?.color ?? "black"}`,
        margin: `${
          props.styles?.margin ? `${props.styles.margin}px 0px` : "10px 0px"
        }`,
        padding: `${
          props.styles?.indent && props.styles.endIndent
            ? `0px ${props.styles.endIndent}px 0px ${props.styles.indent}px`
            : "0px"
        }`,
        width: `${props.styles?.direction === "vertical" ? "0px" : ""}`,
      }}
    />
  );
};

WidgetRegistry.register("Divider", DividerWidget);
