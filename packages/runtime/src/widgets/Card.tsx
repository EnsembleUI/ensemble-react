import type { EnsembleWidget } from "framework";
import { useMemo } from "react";
import { merge } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";
import { EnsembleRuntime } from "../runtime";

interface CardStyles {
  width: string;
  height: string;
  border: string;
  borderRadius: string;
  shadowColor: string;
  shadowOffset: string;
  shadowBlur: string;
  shadowSpread: string;
  padding: string;
  maxWidth: string;
  minWidth: string;
}

export type CardProps = {
  [key: string]: unknown;
  children: EnsembleWidget[];
  styles?: CardStyles;
} & EnsembleWidgetProps;

const defaultStyles: CardStyles = {
  border: "1px solid lightgrey",
  width: "100%",
  height: "100%",
  padding: "20px",
  borderRadius: "10px",
  shadowColor: "lightgrey",
  shadowOffset: "0",
  shadowBlur: "0",
  shadowSpread: "0",
  maxWidth: "250px",
  minWidth: "250px",
};

export const Card: React.FC<CardProps> = ({ children, styles }) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(children);
  }, [children]);
  const mergedStyles = merge(defaultStyles, styles);
  const { shadowOffset, shadowBlur, shadowSpread, shadowColor } = mergedStyles;
  return (
    <div
      style={{
        ...mergedStyles,
        boxShadow: `${shadowOffset} ${shadowOffset} ${shadowBlur} ${shadowSpread} ${shadowColor}`,
      }}
    >
      {renderedChildren}
    </div>
  );
};

WidgetRegistry.register("Card", Card);
