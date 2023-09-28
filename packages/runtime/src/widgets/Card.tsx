import type { Widget } from "framework";
import { useMemo } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";
import { EnsembleRuntime } from "../runtime";

export type CardProps = {
  [key: string]: unknown;
  children: Widget[];
  styles?: {
    gap?: number;
    borderColor?: string;
    borderRadius?: string;
    borderWidth?: string;
    shadowColor?: string;
    shadowOffset?: string;
    shadowBlur?: string;
    margin?: string;
    padding?: string;
  };
} & EnsembleWidgetProps;

export const Card: React.FC<CardProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: props.styles?.gap ?? "4px",
        borderColor: props.styles?.borderColor ?? "transparent",
        borderRadius: props.styles?.borderRadius ?? "10px",
        borderWidth: props.styles?.borderWidth,
        width: props.styles?.width ?? "100%",
        height: props.styles?.height ?? "100%",
        boxShadow: `
		${props.styles?.shadowOffset ? props.styles.shadowOffset : "0"}px 
		${props.styles?.shadowOffset ? props.styles.shadowOffset : "0"}px
		${props.styles?.shadowBlur ? props.styles.shadowBlur : "0"}px 
		0px 
		${props.styles?.shadowColor ? props.styles.shadowColor : "#000"}`,
        padding: props.styles?.padding ?? "0px",
      }}
    >
      {renderedChildren}
    </div>
  );
};

WidgetRegistry.register("Card", Card);
