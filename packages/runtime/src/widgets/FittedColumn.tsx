import { Expression, useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  FlexboxProps,
  FlexboxStyles,
} from "../shared/types";
import { Column } from "./Column";
import { useState } from "react";
import { isArray } from "lodash-es";

interface FittedColumnStyles extends FlexboxStyles {
  childrenFits?: Expression<string[]>;
}

export type FittedColumnProps = {
  childrenFits?: Expression<string[]>;
} & FlexboxProps &
  EnsembleWidgetProps<FittedColumnStyles>;

export const FittedColumn: React.FC<FittedColumnProps> = (props) => {
  const [childrenFits, setChildrenFits] = useState<
    Expression<string[]> | undefined
  >(props.childrenFits || props.styles?.childrenFits);

  const { values } = useRegisterBindings({ childrenFits }, props.id, {
    setChildrenFits,
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
