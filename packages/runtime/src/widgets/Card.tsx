import type { Widget } from "framework";
import { useMemo } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";
import { EnsembleRuntime } from "../runtime";

export type CardProps = {
  [key: string]: unknown;
  children: Widget[];
  styles?: {
    display: string; //write only display options
    flexDirection?:
      | "row"
      | "row-reverse"
      | "column"
      | "column-reverse"
      | undefined;
    justifyContent?:
      | "flex-start"
      | "flex-end"
      | "space-around"
      | "space-evenly"
      | "space-between"; //justify options
    alignItems?:
      | "flex-start"
      | "flex-end"
      | "space-around"
      | "space-evenly"
      | "space-between"; //justify options
    gap?: number;
    border: string;
    borderRadius: string;
    borderWidth: string;
    boxShadow: string;
    width: number;
    height: number;
    margin: string;
    padding: string;
  };
} & EnsembleWidgetProps;

export const Card: React.FC<CardProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);
  return (
    <div
      style={{
        display: props.styles?.display ?? "flex",
        flexDirection: props.styles?.flexDirection ?? "column",
        justifyContent: props.styles?.justifyContent ?? "center",
        gap: props.styles?.gap ?? "4px",
        alignItems: props.styles?.alignItems ?? "center",
        border: props.styles?.border ?? "0px",
        borderRadius: props.styles?.borderRadius ?? "10px",
        borderWidth: props.styles?.borderWidth,
        width: props.styles?.width ?? "100%",
        height: props.styles?.height ?? "100%",
        boxShadow: "5px 5px 8px 0px rgba(0, 0, 0, 0.08)",
        padding: props.styles?.padding ?? "0px",
      }}
    >
      {renderedChildren}
    </div>
  );
};

WidgetRegistry.register("Card", Card);
