import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
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

const widgetName = "Button";

export type ButtonProps = {
  label: Expression<string>;
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
  loading?: boolean;
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = ({ id, onTap, ...rest }) => {
  const [loading, setLoading] = useState<boolean>(rest.loading || false);
  const action = useEnsembleAction(onTap);
  const onClickCallback = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation();
      if (!action) {
        return;
      }
      action.callback();
    },
    [action],
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

  const ButtonComponent = useMemo(() => {
    return (
      <AntButton
        disabled={values?.disabled ?? false}
        htmlType={values?.submitForm === true ? "submit" : "button"}
        loading={loading}
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

        {!loading && values?.startingIcon && values.label ? <>&nbsp;</> : null}

        {!loading && <>{values?.label}</>}

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
