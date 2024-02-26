import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  FlexboxProps,
  FlexboxStyles,
} from "../shared/types";
import { Column } from "./Column";

interface FittedColumnStyles extends FlexboxStyles {
  childrenFits?: string[];
}

export type FittedColumnProps = {
  childrenFits?: string[];
} & FlexboxProps &
  EnsembleWidgetProps<FittedColumnStyles>;

export const FittedColumn: React.FC<FittedColumnProps> = (props) => {
  const { values } = useRegisterBindings({ ...props }, props.id);
  return (
    <Column
      {...props}
      styles={{
        display: "grid",
        gridAutoFlow: "row",
        gridTemplateRows:
          values?.childrenFits
            ?.map((fit) => (fit === "auto" ? fit : `${fit}fr`))
            ?.join(" ") ||
          values?.styles?.childrenFits
            ?.map((fit) => (fit === "auto" ? fit : `${fit}fr`))
            ?.join(" "),
      }}
    />
  );
};

WidgetRegistry.register("FittedColumn", FittedColumn);
