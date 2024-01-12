import { useCallback, useMemo } from "react";
import { Col } from "antd";
import { indexOf, keys } from "lodash-es";
import {
  CustomScopeProvider,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import type { CustomScope } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { FlexboxProps } from "../shared/types";
import { getColor, getCrossAxis, getMainAxis } from "../shared/styles";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

export const Column: React.FC<FlexboxProps> = (props) => {
  const { "item-template": itemTemplate, children, onTap, ...rest } = props;
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
        justifyContent: props.mainAxis && getMainAxis(props.mainAxis),
        alignItems: props.crossAxis && getCrossAxis(props.crossAxis),
        margin: props.margin,
        padding: props.padding,
        gap: props.gap,
        borderRadius: props.styles?.borderRadius,
        borderWidth: props.styles?.borderWidth,
        borderColor: props.styles?.borderColor
          ? getColor(props.styles.borderColor)
          : undefined,
        borderStyle: props.styles?.borderWidth ? "solid" : undefined,
        display: "flex",
        minHeight: "unset",
        cursor: "pointer",
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
    </Col>
  );
};

WidgetRegistry.register("Column", Column);
