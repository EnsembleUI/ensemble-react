import { Checkbox, Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type EnsembleAction,
  unwrapWidget,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import type { EnsembleWidgetProps } from "../../shared/types";
import { EnsembleRuntime } from "../../runtime";
import { WidgetRegistry } from "../../registry";
import { useEnsembleAction } from "../../runtime/hooks";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

export type CheckBoxProps = {
  trailingText?: string | { [key: string]: unknown };
  leadingText?: string;
  onChange?: EnsembleAction;
} & EnsembleWidgetProps &
  FormInputProps<boolean>;

export const CheckboxWidget: React.FC<CheckBoxProps> = (props) => {
  const [checked, setChecked] = useState<boolean>();
  const { values } = useRegisterBindings(
    { ...props, initialValue: props.value, value: checked },
    props.id,
    {
      setValue: setChecked,
    },
  );
  const action = useEnsembleAction(props.onChange);

  const trailingContent = useMemo(() => {
    if (values?.trailingText) {
      if (isString(values.trailingText)) {
        return values.trailingText;
      }

      return EnsembleRuntime.render([unwrapWidget(values.trailingText)]);
    }
  }, [values?.trailingText]);

  const onChangeCallback = useCallback(
    (newValue: boolean) => action?.callback({ value: newValue }),
    [action],
  );

  const handleChange = (newValue: boolean): void => {
    setChecked(newValue);
    onChangeCallback(newValue);
  };

  const formInstance = Form.useFormInstance();

  useEffect(() => {
    setChecked(values?.initialValue as boolean);
  }, [values?.initialValue]);

  useEffect(() => {
    if (formInstance) {
      formInstance.setFieldsValue({
        [values?.id ?? values?.label ?? ""]: checked,
      });
    }
  }, [checked, formInstance]);

  return (
    <EnsembleFormItem valuePropName="checked" values={values}>
      <Checkbox
        checked={Boolean(values?.value)}
        disabled={
          values?.enabled === undefined ? false : Boolean(values.enabled)
        }
        onChange={(event): void => handleChange(event.target.checked)}
        style={{
          marginLeft: `${props.leadingText ? "4px" : "0px"}`,
          ...values?.styles,
        }}
      >
        {trailingContent}
      </Checkbox>
    </EnsembleFormItem>
  );
};

WidgetRegistry.register("Checkbox", CheckboxWidget);
