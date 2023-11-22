import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";

export type DividerProps = {
  styles: DividerStyles;
} & EnsembleWidgetProps;

export interface DividerStyles {
  direction?: "horizontal" | "vertical";
  thickness?: number;
  endIndent?: string | number;
  indent?: string | number;
  color?: string;
}

export const DividerWidget: React.FC<DividerProps> = (props) => {
  return (
    <div
      className="divider"
      style={{
        border: `${
          props.styles.thickness ? `${props.styles.thickness}px` : "1px"
        } solid ${props.styles.color ?? "black"}`,
        margin: `${
          props.styles.margin ? `${props.styles.margin}px 0px` : "10px 0px"
        }`,
        padding: `${
          props.styles.indent && props.styles.endIndent
            ? `0px ${props.styles.endIndent}px 0px ${props.styles.indent}px`
            : "0px"
        }`,
        width: `${props.styles.direction === "vertical" ? "0px" : ""}`,
      }}
    />
  );
};

WidgetRegistry.register("Divider", DividerWidget);
