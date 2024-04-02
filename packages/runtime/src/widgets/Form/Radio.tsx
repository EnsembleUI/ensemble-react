import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { Radio, Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetStyles, HasItemTemplate } from "../../shared/types";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";

export type RadioWidgetProps = FormInputProps<string> &
  HasItemTemplate & {
    items: {
      label: Expression<string>;
      value: Expression<string | number>;
      styles?: EnsembleWidgetStyles;
    }[];
    onChange?: EnsembleAction;
  };
export const RadioWidget: React.FC<RadioWidgetProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const { values, rootRef } = useRegisterBindings(
    { ...props, value },
    props.id,
    { setValue },
  );
  const action = useEnsembleAction(props.onChange);

  const onChangeCallback = useCallback(
    (newValue: string) => {
      if (!action) {
        return;
      }
      action.callback({ value: newValue });
    },
    [action],
  );

  const handleChange = (newValue: string): void => {
    setValue(newValue);
    onChangeCallback(newValue);
  };

  const formInstance = Form.useFormInstance();

  useEffect(() => {
    if (formInstance) {
      formInstance.setFieldsValue({
        [values?.id ?? values?.label ?? ""]: value,
      });
    }
  }, [value, formInstance]);

  return (
    <EnsembleFormItem values={values}>
      <Radio.Group
        disabled={
          values?.enabled === undefined ? false : Boolean(values.enabled)
        }
        onChange={(event): void => handleChange(String(event.target.value))}
        ref={rootRef}
        style={values?.styles}
        value={values?.value}
      >
        {values?.items.map((item) => (
          <Radio
            key={item.value}
            value={item.value}
            style={{
              ...item?.styles,
              ...(item?.styles?.visible === false
                ? { display: "none" }
                : undefined),
            }}
          >
            {item.label}
          </Radio>
        ))}
      </Radio.Group>
    </EnsembleFormItem>
  );
};

WidgetRegistry.register("Radio", RadioWidget);
