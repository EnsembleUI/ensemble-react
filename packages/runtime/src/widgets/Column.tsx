import { useCallback, useMemo } from "react";
import { Col } from "antd";
import { indexOf, keys } from "lodash-es";
import {
  CustomScopeProvider,
  useCustomScope,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import type { CustomScope } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { FlexboxProps } from "../shared/types";
import { getColor, getCrossAxis, getMainAxis } from "../shared/styles";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

const widgetName = "Column";

export const Column: React.FC<FlexboxProps> = (props) => {
  const { "item-template": itemTemplate, children, onTap, ...rest } = props;
  const childrenFirst =
    indexOf(keys(props), "children") < indexOf(keys(props), "item-template");

  const { values, rootRef } = useRegisterBindings(
    { ...rest, widgetName },
    props.id,
  );
  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const parentScope = useCustomScope();

  const renderedChildren = useMemo(() => {
    return children ? EnsembleRuntime.render(children) : null;
  }, [children]);
  const action = useEnsembleAction(onTap);
  const onClickCallback = useCallback(() => {
    if (!action) {
      return;
    }
    action.callback();
  }, [action]);
  return (
    <Col
      className={values?.styles?.names}
      onClick={onClickCallback}
      ref={rootRef}
      style={{
        flexDirection: "column",
        justifyContent:
          (values?.mainAxis || values?.styles?.mainAxis) &&
          getMainAxis(values.mainAxis || values.styles?.mainAxis || ""),
        alignItems:
          (values?.crossAxis || values?.styles?.crossAxis) &&
          getCrossAxis(values.crossAxis || values.styles?.crossAxis || ""),
        margin: values?.margin || values?.styles?.margin,
        padding: values?.padding || values?.styles?.padding,
        gap: values?.gap || values?.styles?.gap,
        backgroundColor: values?.styles?.backgroundColor
          ? getColor(values.styles.backgroundColor)
          : undefined,
        borderRadius: values?.styles?.borderRadius,
        borderWidth: values?.styles?.borderWidth,
        borderColor: values?.styles?.borderColor
          ? getColor(values.styles.borderColor)
          : undefined,
        borderStyle: values?.styles?.borderWidth ? "solid" : undefined,
        display: "flex",
        minHeight: "unset",
        cursor: props.onTap ? "pointer" : "auto",
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
        ...values?.styles,
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
    </Col>
  );
};

WidgetRegistry.register(widgetName, Column);
