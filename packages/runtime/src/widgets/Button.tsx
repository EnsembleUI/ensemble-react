import type { EnsembleAction, Expression } from "framework";
import { useRegisterBindings } from "framework";
import { Button as AntButton, Form as AntForm } from "antd";
import { useCallback } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, IconProps } from "../util/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Icon } from "./Icon";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: EnsembleAction;
  submitForm?: boolean;
  startingIcon?: IconProps;
  endingIcon?: IconProps;
  styles?: {
    textColor: string;
    borderColor: string;
    borderRadius: string;
    borderWidth: string;
    gap?: number | string;
    backgroundColor?: number | string;
    padding?: number | string;
  };
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const { values } = useRegisterBindings(props, props.id);
  const action = useEnsembleAction(props.onTap);
  const onClickCallback = useCallback(() => {
    if (!action) {
      return;
    }
    action.callback();
  }, [action]);
  if (values.submitForm) {
    return (
      <AntForm.Item
        style={{
          margin: "0px",
        }}
      >
        <>
          <AntButton
            htmlType="submit"
            onClick={onClickCallback}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "auto",
              backgroundColor: String(props.styles?.backgroundColor),
              padding: props.styles?.padding,
              color: props.styles?.textColor ?? "black",
              borderColor: props.styles?.borderColor,
              borderWidth: props.styles?.borderWidth,
              borderRadius: props.styles?.borderRadius,
            }}
          >
            {props.startingIcon ? <Icon {...props.startingIcon} /> : null}
            &nbsp;
            {values.label}
            {props.endingIcon ? <Icon {...props.endingIcon} /> : null}
          </AntButton>
          {action && "Modal" in action ? action.Modal : null}
        </>
      </AntForm.Item>
    );
  }
  return (
    <>
      <AntButton
        onClick={onClickCallback}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
          backgroundColor: String(props.styles?.backgroundColor),
          padding: props.styles?.padding,
          color: props.styles?.textColor ?? "black",
          borderColor: props.styles?.borderColor,
          borderWidth: props.styles?.borderWidth,
          borderRadius: props.styles?.borderRadius,
        }}
      >
        {props.startingIcon ? <Icon {...props.startingIcon} /> : null}
        &nbsp;
        {values.label}
        {props.endingIcon ? <Icon {...props.endingIcon} /> : null}
      </AntButton>
      {action && "Modal" in action ? action.Modal : null}
    </>
  );
};

WidgetRegistry.register("Button", Button);
