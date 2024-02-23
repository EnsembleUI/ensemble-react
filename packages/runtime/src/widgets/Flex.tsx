import { type EnsembleWidget } from "@ensembleui/react-framework";
import { omit } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetStyles,
  EnsembleWidgetProps,
  HasItemTemplate,
  FlexboxStyles,
} from "../shared/types";
import { Column } from "./Column";
import { Row } from "./Row";

interface FlexStyles extends EnsembleWidgetStyles {
  direction?: "horizontal" | "vertical" | undefined;
  gap?: number;
}

export type FlexProps = {
  children?: EnsembleWidget[];
} & HasItemTemplate &
  EnsembleWidgetProps<FlexStyles & FlexboxStyles>;

export const FlexWidget: React.FC<FlexProps> = (props) => {
  return (
    <>
      {props.styles?.direction === "vertical" ? (
        <Column {...props} styles={{ ...omit(props.styles, ["direction"]) }} />
      ) : (
        <Row {...props} styles={{ ...omit(props.styles, ["direction"]) }} />
      )}
    </>
  );
};

WidgetRegistry.register("Flex", FlexWidget);
