import { Checkbox } from "antd";
import { useMemo, useState } from "react";
import {
  EnsembleAction,
  unwrapWidget,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import type { EnsembleWidgetProps } from "../../shared/types";
import { EnsembleRuntime } from "../../runtime";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";
import { useEnsembleAction } from "../../runtime/hooks";

export type CheckBoxProps = {
  trailingText?: string | { [key: string]: unknown };
  leadingText?: string;
  onCheck?: EnsembleAction;
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
  const action = useEnsembleAction(props.onCheck);

  const trailingContent = useMemo(() => {
    if (values?.trailingText) {
      if (isString(values.trailingText)) {
        return values.trailingText;
      }

      return EnsembleRuntime.render([unwrapWidget(values.trailingText)]);
    }
  }, [values?.trailingText]);

  const onCheckCallback = useMemo(
    () => (newValue: boolean) => action?.callback({ value: newValue }),
    [action],
  );

  const handleChange = (newValue: boolean): void => {
    setChecked(newValue);
    onCheckCallback(newValue);
  };

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
