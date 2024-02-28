import { useCallback, useMemo, useState } from "react";
import { Slider } from "antd";
import {
  useRegisterBindings,
  type EnsembleAction,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks";
import { type EnsembleWidgetProps } from "../shared/types";
import type { FormInputProps } from "./Form/types";
import { EnsembleFormItem } from "./Form/FormItem";

interface SliderStyles {
  maxWidth: string;
}

export type SliderProps = {
  initialValue?: number;
  onChange?: EnsembleAction;
  onComplete?: EnsembleAction;
  min?: number;
  max?: number;
  vertical?: boolean;
  reverse?: boolean;
  dots?: boolean;
  divisions?: number;
} & FormInputProps<number | number[]> &
  EnsembleWidgetProps<SliderStyles>;

const SliderWidget: React.FC<SliderProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const { values } = useRegisterBindings({ ...props, value }, props.id, {
    setValue,
  });
  const onChangeAction = useEnsembleAction(props.onChange);
  const onCompleteAction = useEnsembleAction(props.onComplete);

  const onChangeActionCallback = useCallback(
    (newValue: number) => {
      if (!onChangeAction) {
        return;
      }

      onChangeAction.callback({ value: newValue });
    },
    [onChangeAction],
  );

  const onCompleteActionCallback = useCallback(
    (newValue: number) => {
      if (!onCompleteAction) {
        return;
      }

      onCompleteAction.callback({ value: newValue });
    },
    [onCompleteAction],
  );

  const steps = useMemo(() => {
    return ((values?.max || 0) - (values?.min || 0)) / (values?.divisions || 1);
  }, [values?.max, values?.min, values?.divisions]);

  const handleChange = (newValue: number): void => {
    setValue(newValue);
    onChangeActionCallback(newValue);
  };

  const handleAfterChangeComplete = (newValue: number): void => {
    setValue(newValue);
    onCompleteActionCallback(newValue);
  };

  const customStyle = `
    .ant-slider {
      max-width: ${values?.styles?.maxWidth || "unset"}
    }
  `;

  return (
    <>
      <style>{customStyle}</style>
      <EnsembleFormItem values={values}>
        <Slider
          defaultValue={values?.initialValue}
          disabled={
            values?.enabled === undefined ? false : Boolean(!values.enabled)
          }
          dots={values?.dots}
          max={values?.max}
          min={values?.min}
          onAfterChange={handleAfterChangeComplete}
          onChange={handleChange}
          reverse={values?.reverse}
          step={steps}
          value={values?.value as number}
          vertical={values?.vertical}
        />
      </EnsembleFormItem>
    </>
  );
};

WidgetRegistry.register("Slider", SliderWidget);
