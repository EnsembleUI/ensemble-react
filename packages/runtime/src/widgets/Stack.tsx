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
        top: 0;
        left: 0;
      `;
      break;

    case "topCenter":
      alignmentStyles = `
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      `;
      break;

    case "topRight":
      alignmentStyles = `
        top: 0;
        right: 0;
      `;
      break;

    case "centerLeft":
      alignmentStyles = `
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      `;
      break;

    case "center":
      alignmentStyles = `
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
      break;

    case "centerRight":
      alignmentStyles = `
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      `;
      break;

    case "bottomLeft":
      alignmentStyles = `
        bottom: 0;
        left: 0;
      `;
      break;

    case "bottomCenter":
      alignmentStyles = `
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
      `;
      break;

    case "bottomRight":
      alignmentStyles = `
        botton: 0;
        right: 0;
      `;
      break;

    case "default":
      alignmentStyles = "";
      break;
  }

  return `#${id} > :not(:first-child) {position: absolute; ${alignmentStyles}}`;
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
      <div id={id} ref={rootRef} style={{ position: "relative" }}>
        {renderedChildren}
      </div>
      <style>
        {calculateStackAlignment(id, values?.styles?.alignChildren || "center")}
      </style>
    </>
  );
};

WidgetRegistry.register("Stack", Stack);
