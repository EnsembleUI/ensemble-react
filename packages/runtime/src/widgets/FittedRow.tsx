import { Expression, useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  FlexboxProps,
  FlexboxStyles,
} from "../shared/types";
import { Row } from "./Row";
import { useState } from "react";
import { isArray } from "lodash-es";

interface FittedRowStyles extends FlexboxStyles {
  childrenFits?: Expression<string[]>;
}

export type FittedRowProps = {
  childrenFits?: Expression<string[]>;
} & FlexboxProps &
  EnsembleWidgetProps<FittedRowStyles>;

export const FittedRow: React.FC<FittedRowProps> = (props) => {
  const [childrenFits, setChildrenFits] = useState<
    Expression<string[]> | undefined
  >(props.childrenFits || props.styles?.childrenFits);

  const { values } = useRegisterBindings({ childrenFits }, props.id, {
    setChildrenFits,
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
