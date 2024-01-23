import { useCallback, useMemo } from "react";
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
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

export const Row: React.FC<FlexboxProps> = (props) => {
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
    <AntRow
      className={values?.styles?.names}
      onClick={onClickCallback}
      ref={rootRef}
      style={{
        justifyContent:
          (values?.mainAxis || values?.styles?.mainAxis) &&
          getMainAxis(props.mainAxis || values?.styles?.mainAxis || ""),
        alignItems:
          (values?.crossAxis || values?.styles?.crossAxis) &&
          getCrossAxis(values?.crossAxis || values?.styles?.crossAxis || ""),
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
        maxWidth: values?.maxWidth ?? "100%",
        minWidth: values?.minWidth,
        flexDirection: "row",
        flexFlow: "unset",
        flexGrow: "unset",
        cursor: props?.onTap ? "pointer" : "auto",
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
