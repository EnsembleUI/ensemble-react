import { useMemo } from "react";
import {
  CustomScope,
  CustomScopeProvider,
  useCustomScope,
  useRegisterBindings,
  useTemplateData,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { isEmpty, isObject, omit } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import {
  type EnsembleWidgetStyles,
  type EnsembleWidgetProps,
  type HasItemTemplate,
} from "../shared/types";

interface FlexStyles extends EnsembleWidgetStyles {
  direction?: "horizontal" | "vertical" | undefined;
  gap?: string;
  lineGap?: string;
  overflow?: string;
}

export type FlexProps = {
  children?: EnsembleWidget[];
} & HasItemTemplate &
  EnsembleWidgetProps<FlexStyles>;

export const FlexWidget: React.FC<FlexProps> = (props) => {
  const { "item-template": itemTemplate, children, ...rest } = props;
  const parentScope = useCustomScope();
  const { values } = useRegisterBindings({ ...rest });

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const renderedChildren = useMemo(() => {
    const childrenItems = [];

    if (children) {
      childrenItems.push(EnsembleRuntime.render(children));
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      const tempChildrens = namedData.map((item, index) => {
        return (
          <CustomScopeProvider
            key={index}
            value={{ ...parentScope, ...item } as CustomScope}
          >
            {EnsembleRuntime.render([itemTemplate.template])}
          </CustomScopeProvider>
        );
      });

      childrenItems.push(...tempChildrens);
    }

    return childrenItems;
  }, [children, itemTemplate, namedData, parentScope]);

  const customStyles = `
    .flex_layout > * {
        flex-shrink: 0;
    }
  `;

  return (
    <div
      className="flex_layout"
      style={{
        display: "flex",
        flexDirection:
          values?.styles?.direction === "vertical" ? "column" : "row",
        columnGap: values?.styles?.gap ?? 4,
        rowGap: values?.styles?.lineGap ?? 4,
        ...omit(values?.styles, ["direction"]),
        overflow: values?.styles?.overflow ?? "hidden",
      }}
    >
      <style>{customStyles}</style>
      {renderedChildren}
    </div>
  );
};

WidgetRegistry.register("Flex", FlexWidget);
