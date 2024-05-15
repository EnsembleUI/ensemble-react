import {
  type EnsembleWidget,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import React, { useMemo } from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../shared/types";

interface StackStyles extends EnsembleWidgetStyles {
  alignChildren:
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "centerLeft"
    | "center"
    | "centerRight"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight";
}

type StackProps = {
  children: EnsembleWidget[];
} & EnsembleWidgetProps<StackStyles>;

// useful to calculate stack alighment styles based on alignment direction
const calculateStackAlignment = (id: string, alignment: string): string => {
  let alignmentStyles = "";

  switch (alignment) {
    case "topLeft":
      alignmentStyles = `
        align-items: start;
        justify-items: left;
      `;
      break;

    case "topCenter":
      alignmentStyles = `
        align-items: start;
        justify-items: center;
      `;
      break;

    case "topRight":
      alignmentStyles = `
        align-items: start;
        justify-items: right;
      `;
      break;

    case "centerLeft":
      alignmentStyles = `
        align-items: center;
        justify-items: left;
      `;
      break;

    case "center":
      alignmentStyles = `
        align-items: center;
        justify-items: center;
      `;
      break;

    case "centerRight":
      alignmentStyles = `
        align-items: center;
        justify-items: right;
      `;
      break;

    case "bottomLeft":
      alignmentStyles = `
        align-items: end;
        justify-items: left;
      `;
      break;

    case "bottomCenter":
      alignmentStyles = `
        align-items: end;
        justify-items: center;
      `;
      break;

    case "bottomRight":
      alignmentStyles = `
        align-items: end;
        justify-items: right;
      `;
      break;

    case "default":
      alignmentStyles = "";
      break;
  }

  return `#${id} {${alignmentStyles}} #${id} > * {grid-area: 1 / 1 / 3 / 3;}`;
};

export const Stack: React.FC<StackProps> = (props) => {
  const { children, ...rest } = props;
  const { values, rootRef, id } = useRegisterBindings({ ...rest }, props.id);

  // render childrens
  const renderedChildren = useMemo(() => {
    return children ? EnsembleRuntime.render(children) : null;
  }, [children]);

  return (
    <>
      <div id={id} ref={rootRef} style={{ margin: "auto", display: "grid" }}>
        {renderedChildren}
      </div>
      <style>
        {calculateStackAlignment(id, values?.styles?.alignChildren || "center")}
      </style>
    </>
  );
};

WidgetRegistry.register("Stack", Stack);
