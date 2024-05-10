import { type Expression, useEvaluate } from "@ensembleui/react-framework";
import { isArray } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  FlexboxProps,
  FlexboxStyles,
} from "../shared/types";
import { Column } from "./Column";

interface FittedColumnStyles extends FlexboxStyles {
  childrenFits?: Expression<string[]>;
}

export type FittedColumnProps = {
  childrenFits?: Expression<string[]>;
} & FlexboxProps &
  EnsembleWidgetProps<FittedColumnStyles>;

export const FittedColumn: React.FC<FittedColumnProps> = (props) => {
  const values = useEvaluate({
    childrenFits: props.childrenFits || props.styles?.childrenFits,
  });

  return (
    <Column
      {...props}
      styles={{
        display: "grid",
        gridAutoFlow: "row",
        gridTemplateRows: isArray(values?.childrenFits)
          ? values?.childrenFits
              ?.map((fit) => (fit === "auto" ? fit : `${fit}fr`))
              ?.join(" ")
          : "auto",
        ...props?.styles,
      }}
    />
  );
};

WidgetRegistry.register("FittedColumn", FittedColumn);
