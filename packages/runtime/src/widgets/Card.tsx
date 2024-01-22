import type { EnsembleWidget } from "@ensembleui/react-framework";
import { useMemo } from "react";
import { merge } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";
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
  gap?: string;
}

export type CardProps = {
  children: EnsembleWidget[];
} & EnsembleWidgetProps<CardStyles>;

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
  const { shadowOffset, shadowBlur, shadowSpread, shadowColor, gap } =
    mergedStyles;

  return (
    <>
      <style>
        {`
          #ensemble-card > :not(:first-child) {
            ${
              gap
                ? `
                    display: block;
                    margin-top: ${gap};
                  `
                : ""
            }
          }
        `}
      </style>
      <div
        id="ensemble-card"
        style={{
          ...mergedStyles,
          boxShadow: `${shadowOffset} ${shadowOffset} ${shadowBlur} ${shadowSpread} ${shadowColor}`,
        }}
      >
        {renderedChildren}
      </div>
    </>
  );
};

WidgetRegistry.register("Card", Card);
