import { useMemo } from "react";
import { Row as AntRow } from "antd";
import { indexOf, keys } from "lodash-es";
import {
  type CustomScope,
  CustomScopeProvider,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { getColor, getCrossAxis, getMainAxis } from "../shared/styles";
import type { FlexboxProps } from "../shared/types";

export const Row: React.FC<FlexboxProps> = (props) => {
  const { "item-template": itemTemplate, children, ...rest } = props;
  const childrenFirst =
    indexOf(keys(props), "children") < indexOf(keys(props), "item-template");

  const { values, rootRef } = useRegisterBindings({ ...rest }, props.id);
  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const renderedChildren = useMemo(() => {
    return children ? EnsembleRuntime.render(children) : null;
  }, [children]);

  return (
    <AntRow
      className={values?.styles?.names}
      ref={rootRef}
      style={{
        justifyContent: props.mainAxis && getMainAxis(props.mainAxis),
        alignItems: props.crossAxis && getCrossAxis(props.crossAxis),
        margin: props.margin,
        padding: props.padding,
        gap: props.gap,
        backgroundColor: props.styles?.backgroundColor
          ? getColor(props.styles.backgroundColor)
          : undefined,
        borderRadius: props.styles?.borderRadius,
        borderWidth: props.styles?.borderWidth,
        borderColor: props.styles?.borderColor
          ? getColor(props.styles.borderColor)
          : undefined,
        borderStyle: props.styles?.borderWidth ? "solid" : undefined,
        maxWidth: props.maxWidth ?? "100%",
        minWidth: props.minWidth,
        flexDirection: "row",
        flexFlow: "unset",
        flexGrow: "unset",
        ...values?.styles,
      }}
    >
      {childrenFirst ? renderedChildren : null}
      {namedData.map((n, index) => (
        <CustomScopeProvider
          key={index}
          value={
            {
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
    </AntRow>
  );
};

WidgetRegistry.register("Row", Row);
