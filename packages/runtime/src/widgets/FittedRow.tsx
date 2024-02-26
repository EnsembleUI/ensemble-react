import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  FlexboxProps,
  FlexboxStyles,
} from "../shared/types";
import { Row } from "./Row";

interface FittedRowStyles extends FlexboxStyles {
  childrenFits?: string[];
}

export type FittedRowProps = {
  childrenFits?: string[];
} & FlexboxProps &
  EnsembleWidgetProps<FittedRowStyles>;

export const FittedRow: React.FC<FittedRowProps> = (props) => {
  const { values } = useRegisterBindings({ ...props }, props.id);
  return (
    <Row
      {...props}
      styles={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateColumns:
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

WidgetRegistry.register("FittedRow", FittedRow);
