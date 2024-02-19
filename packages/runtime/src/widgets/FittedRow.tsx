import { useCallback, useMemo } from "react";
import { Row as AntRow } from "antd";
import { indexOf, keys } from "lodash-es";
import {
  type CustomScope,
  CustomScopeProvider,
  useRegisterBindings,
  useTemplateData,
  useCustomScope,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { getColor, getCrossAxis, getMainAxis } from "../shared/styles";
import type { FlexboxProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

export const FittedRow: React.FC<FlexboxProps<true>> = (props) => {
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
  const parentScope = useCustomScope();
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
        maxWidth: values?.maxWidth ?? "100%",
        minWidth: values?.minWidth,
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateColumns:
          values?.childrenFits
            ?.map((fit) => (fit === "auto" ? fit : `${fit}fr`))
            ?.join(" ") ||
          values?.styles?.childrenFits
            ?.map((fit) => (fit === "auto" ? fit : `${fit}fr`))
            ?.join(" "),
        cursor: values?.onTap ? "pointer" : "auto",
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
    </AntRow>
  );
};

WidgetRegistry.register("FittedRow", FittedRow);
