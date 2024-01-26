import { Checkbox } from "antd";
import { useMemo, useState } from "react";
import { unwrapWidget, useRegisterBindings } from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import type { EnsembleWidgetProps } from "../../shared/types";
import { EnsembleRuntime } from "../../runtime";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

export type CheckBoxProps = {
  trailingText?: string | Record<string, unknown>;
  leadingText?: string;
} & EnsembleWidgetProps &
  FormInputProps<boolean>;

export const CheckboxWidget: React.FC<CheckBoxProps> = (props) => {
  const [checked, setChecked] = useState(props.value || false);
  const { values } = useRegisterBindings(
    { ...props, value: checked },
    props.id,
    {
      setValue: setChecked,
    },
  );

  const trailingContent = useMemo(() => {
    if (values?.trailingText) {
      if (isString(values.trailingText)) {
        return values.trailingText;
      }

      return EnsembleRuntime.render([unwrapWidget(values.trailingText)]);
    }
  }, [values?.trailingText]);

  return (
    <EnsembleFormItem valuePropName="checked" values={values}>
      <Checkbox
        checked={Boolean(values?.value)}
        disabled={
          values?.enabled === undefined ? false : Boolean(values.enabled)
        }
        onChange={(event): void => setChecked(event.target.checked)}
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
