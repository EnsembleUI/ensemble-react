import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { Radio, Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetStyles, HasItemTemplate } from "../../shared/types";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

const widgetName = "Radio";

export type RadioWidgetProps = FormInputProps<string> &
  HasItemTemplate & {
    items: {
      label: Expression<string>;
      value: Expression<string | number>;
      styles?: EnsembleWidgetStyles;
      enabled?: Expression<boolean>;
    }[];
    onChange?: EnsembleAction;
  };

export const RadioWidget: React.FC<RadioWidgetProps> = (props) => {
  const [value, setValue] = useState<string | number | undefined>(undefined);
  const { values, rootRef } = useRegisterBindings(
    { ...props, initialValue: props.value, value, widgetName },
    props.id,
    { setValue },
  );
  const action = useEnsembleAction(props.onChange);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      action?.callback({ value: newValue })
    },
    [action],
  );

  const formInstance = Form.useFormInstance();

  useEffect(() => {
    setValue(values?.initialValue?.toString());
  }, [values?.initialValue]);

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
        onChange={(event): void => handleChange(String(event.target.value))}
        ref={rootRef}
        style={values?.styles}
        value={String(values?.value)}
      >
        {values?.items.map((item) => (
          <Radio
            disabled={values?.enabled === false || item.enabled === false}
            key={item.value}
            style={{
              ...item.styles,
              ...(item.styles?.visible === false
                ? { display: "none" }
                : undefined),
            }}
            value={String(item.value)}
          >
            {item.label}
          </Radio>
        ))}
      </Radio.Group>
    </EnsembleFormItem>
  );
};

WidgetRegistry.register(widgetName, RadioWidget);
