import { Expression, useEvaluate } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  FlexboxProps,
  FlexboxStyles,
} from "../shared/types";
import { Row } from "./Row";
import { isArray } from "lodash-es";

interface FittedRowStyles extends FlexboxStyles {
  childrenFits?: Expression<string[]>;
}

export type FittedRowProps = {
  childrenFits?: Expression<string[]>;
} & FlexboxProps &
  EnsembleWidgetProps<FittedRowStyles>;

export const FittedRow: React.FC<FittedRowProps> = (props) => {
  const values = useEvaluate({
    childrenFits: props.childrenFits || props.styles?.childrenFits,
  });

  return (
    <Row
      {...props}
      styles={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateColumns: isArray(values?.childrenFits)
          ? values?.childrenFits
              ?.map((fit) => (fit === "auto" ? fit : `${fit}fr`))
              ?.join(" ")
          : "auto",
        ...props?.styles,
      }}
    />
  );
};

WidgetRegistry.register("FittedRow", FittedRow);
