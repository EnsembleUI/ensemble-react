import { useMemo } from "react";
import { indexOf, keys, omit } from "lodash-es";
import {
  useRegisterBindings,
  type EnsembleWidget,
  type Expression,
  type TemplateData,
  useTemplateData,
  CustomScopeProvider,
  useCustomScope,
  type CustomScope,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../shared/types";
import { EnsembleRuntime } from "../runtime";

const widgetName = "Flow";

export interface FlexStyles extends EnsembleWidgetStyles {
  direction?: "horizontal" | "vertical" | undefined;
  gap?: string;
  lineGap?: string;
}

export type FlowProps = {
  "item-template"?: {
    data: Expression<TemplateData>;
    name: string;
    template: EnsembleWidget;
  };
  children: EnsembleWidget[];
} & EnsembleWidgetProps<FlexStyles>;

export const Flow: React.FC<FlowProps> = (props) => {
  const { "item-template": itemTemplate, children, ...rest } = props;
  const childrenFirst =
    indexOf(keys(props), "children") < indexOf(keys(props), "item-template");
  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });
  const parentScope = useCustomScope();
  const renderedChildren = useMemo(() => {
    return children ? EnsembleRuntime.render(children) : null;
  }, [children]);
  const { values, rootRef } = useRegisterBindings(
    { ...rest, widgetName },
    props.id,
  );
  return (
    <div
      className={values?.styles?.names}
      ref={rootRef}
      style={{
        display: "flex",
        flexDirection:
          values?.styles?.direction === "vertical" ? "column" : "row",
        flexWrap: "wrap",
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
        columnGap: values?.styles?.gap ?? 4,
        rowGap: values?.styles?.lineGap ?? 4,
        ...omit(values?.styles, ["direction"]),
      }}
    >
      {childrenFirst ? renderedChildren : null}
      {namedData.map((n, index) => (
        <CustomScopeProvider
          key={index}
          value={
            {
              ...parentScope,
              ...n,
              index,
              length: namedData.length,
            } as CustomScope
          }
        >
          {itemTemplate?.template
            ? EnsembleRuntime.render([itemTemplate.template])
            : null}
        </CustomScopeProvider>
      ))}
      {!childrenFirst && renderedChildren}
    </div>
  );
};

WidgetRegistry.register(widgetName, Flow);
