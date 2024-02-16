import {
  useRegisterBindings,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import {
  type EnsembleWidgetStyles,
  type EnsembleWidgetProps,
  type HasItemTemplate,
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
  EnsembleWidgetProps<FlexStyles>;

export const FlexWidget: React.FC<FlexProps> = (props) => {
  const { "item-template": itemTemplate, children, ...rest } = props;
  const { values } = useRegisterBindings({ ...rest });

  return (
    <>
      {values?.styles?.direction === "vertical" ? (
        <Column
          item-template={itemTemplate}
          styles={{ gap: values.styles.gap || 4 }}
        >
          {children}
        </Column>
      ) : (
        <Row
          item-template={itemTemplate}
          styles={{ gap: values?.styles?.gap || 4 }}
        >
          {children}
        </Row>
      )}
    </>
  );
};

WidgetRegistry.register("Flex", FlexWidget);
