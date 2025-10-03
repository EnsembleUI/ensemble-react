import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { unwrapWidget, useRegisterBindings } from "@ensembleui/react-framework";
import { Button as AntButton, Form as AntForm } from "antd";
import {
  type MouseEvent,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, IconProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Icon } from "./Icon";
import { EnsembleRuntime } from "../runtime";
import { isObject } from "lodash-es";

const widgetName = "Button";

export type ButtonProps = {
  label: Expression<string> | { [key: string]: unknown };
  onTap?: EnsembleAction;
  submitForm?: boolean;
  startingIcon?: IconProps;
  disabled?: boolean;
  endingIcon?: IconProps;
  styles?: {
    /** @uiType color */
    textColor?: string;
    gap?: string | number;
  };
  loading?: Expression<boolean>;
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = ({ id, onTap, ...rest }) => {
  const [loading, setLoading] = useState<Expression<boolean>>(
    rest.loading || false,
  );
  const action = useEnsembleAction(onTap);
  const onClickCallback = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation();
      action?.callback();
    },
    [action?.callback],
  );

  const { values, rootRef } = useRegisterBindings(
    { ...rest, loading, widgetName },
    id,
    {
      click: onClickCallback,
      setLoading,
    },
  );

  useEffect(() => {
    if (values?.loading !== undefined) {
      setLoading(values.loading);
    }
  }, [values?.loading]);

  const label = useMemo(() => {
    const rawLabel = values?.label;
    if (!rawLabel) return null;
    if (!isObject(rawLabel)) return rawLabel;
    return EnsembleRuntime.render([unwrapWidget(rawLabel)]);
  }, [values?.label]);

  const ButtonComponent = useMemo(() => {
    return (
      <AntButton
        disabled={values?.disabled ?? false}
        className={values?.styles?.names}
        htmlType={values?.submitForm === true ? "submit" : "button"}
        loading={Boolean(loading)}
        onClick={onClickCallback}
        ref={rootRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
          color: values?.styles?.textColor ?? "black",
          ...values?.styles,
          ...(values?.styles?.visible === false
            ? { display: "none" }
            : undefined),
        }}
      >
        {!loading && values?.startingIcon ? (
          <Icon {...values.startingIcon} />
        ) : null}

        {!loading && <>{label}</>}

        {!loading && values?.endingIcon ? (
          <Icon {...values.endingIcon} />
        ) : null}
      </AntButton>
    );
  }, [onClickCallback, rootRef, values, loading]);

  if (values?.submitForm) {
    return (
      <AntForm.Item
        style={{
          margin: "0px",
        }}
      >
        {ButtonComponent}
      </AntForm.Item>
    );
  }
  return ButtonComponent;
};

WidgetRegistry.register(widgetName, Button);
