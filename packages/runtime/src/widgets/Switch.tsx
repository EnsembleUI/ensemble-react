import React, { useCallback, useMemo, useState } from "react";
import { Switch } from "antd";
import {
  unwrapWidget,
  useRegisterBindings,
  type EnsembleAction,
} from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../shared/types";
import { EnsembleRuntime } from "../runtime";
import type { FormInputProps } from "./Form/types";
import { EnsembleFormItem } from "./Form/FormItem";

const widgetName = "Switch";

export interface SwitchStyles extends EnsembleWidgetStyles {
  activeColor?: string;
  activeThumbColor?: string;
  inactiveColor?: string;
  inactiveThumbColor?: string;
}

export type SwitchProps = {
  onChange?: EnsembleAction;
  size?: "default" | "small" | undefined;
  loading?: boolean;
  trailingText?: string | { [key: string]: unknown };
  leadingText?: string | { [key: string]: unknown };
} & EnsembleWidgetProps<SwitchStyles> &
  FormInputProps<boolean>;

export const SwitchWidget: React.FC<SwitchProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const { values } = useRegisterBindings(
    { ...props, value, widgetName },
    props.id,
    {
      setValue,
    },
  );
  const onChangeAction = useEnsembleAction(props.onChange);

  const onChangeActionCallback = useCallback(
    (newValue: boolean) => {
      if (!onChangeAction) {
        return;
      }

      onChangeAction.callback({ value: newValue });
    },
    [onChangeAction],
  );

  const handleChange = (newValue: boolean): void => {
    setValue(newValue);
    onChangeActionCallback(newValue);
  };

  const trailingContent = useMemo(() => {
    if (values?.trailingText) {
      if (isString(values.trailingText)) {
        return values.trailingText;
      }

      return EnsembleRuntime.render([unwrapWidget(values.trailingText)]);
    }
  }, [values?.trailingText]);

  const leadingContent = useMemo(() => {
    if (values?.leadingText) {
      if (isString(values.leadingText)) {
        return values.leadingText;
      }

      return EnsembleRuntime.render([unwrapWidget(values.leadingText)]);
    }
  }, [values?.leadingText]);

  const customStyles = `
    .ant-switch {
      margin-right: ${values?.trailingText ? "4px" : "0px"} !important;
      margin-left: ${values?.leadingText ? "4px" : "0px"} !important;
    }

    .ant-switch-handle::before {
        background: ${values?.styles?.inactiveThumbColor || "#fff"} !important;
    }

    .ant-switch-checked .ant-switch-handle::before {
        background: ${values?.styles?.activeThumbColor || "#fff"} !important;
    }

    .ant-switch-inner {
        background: ${values?.styles?.inactiveColor || "inherit"} !important;
    }

    .ant-switch-checked .ant-switch-inner {
        background: ${values?.styles?.activeColor || "inherit"} !important;
    }
  `;

  return (
    <EnsembleFormItem valuePropName="checked" values={values}>
      <style>{customStyles}</style>
      {leadingContent}
      <Switch
        checked={values?.value as boolean}
        disabled={values?.enabled === false}
        loading={values?.loading}
        onChange={handleChange}
        size={values?.size}
      />
      {trailingContent}
    </EnsembleFormItem>
  );
};

WidgetRegistry.register(widgetName, SwitchWidget);
