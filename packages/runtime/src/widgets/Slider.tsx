import { useCallback, useEffect, useMemo, useState } from "react";
import { Slider } from "antd";
import { isEmpty } from "lodash-es";
import {
  useRegisterBindings,
  type EnsembleAction,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks";
import { type EnsembleWidgetProps } from "../shared/types";
import type { FormInputProps } from "./Form/types";
import { EnsembleFormItem } from "./Form/FormItem";

const widgetName = "Slider";

interface SliderStyles {
  maxWidth: string;
}

export type SliderProps = {
  initialValue?: number | [number, number];
  onChange?: EnsembleAction;
  onComplete?: EnsembleAction;
  min?: number;
  max?: number;
  vertical?: boolean;
  reverse?: boolean;
  dots?: boolean;
  divisions?: number;
  range?: boolean;
} & FormInputProps<number | [number, number]> &
  EnsembleWidgetProps<SliderStyles>;

const SliderWidget: React.FC<SliderProps> = (props) => {
  const [value, setValue] = useState<number | [number, number]>();
  const { values, rootRef } = useRegisterBindings(
    { ...props, value, widgetName },
    props.id,
    {
      setValue,
    },
  );

  useEffect(() => {
    if (isEmpty(value) && values?.initialValue) {
      setValue(values.initialValue);
    }
  }, [values?.initialValue]);

  const onChangeAction = useEnsembleAction(props.onChange);
  const onCompleteAction = useEnsembleAction(props.onComplete);

  const onChangeActionCallback = useCallback(
    (newValue: number | [number, number]) => {
      onChangeAction?.callback({ value: newValue });
    },
    [onChangeAction?.callback],
  );

  const onCompleteActionCallback = useCallback(
    (newValue: number | [number, number]) => {
      onCompleteAction?.callback({ value: newValue });
    },
    [onCompleteAction?.callback],
  );

  const steps = useMemo(() => {
    return ((values?.max || 0) - (values?.min || 0)) / (values?.divisions || 1);
  }, [values?.max, values?.min, values?.divisions]);

  const handleChange = (newValue: number | number[]): void => {
    setValue(newValue as [number, number]);
    onChangeActionCallback(newValue as [number, number]);
  };

  const handleAfterChangeComplete = (newValue: number | number[]): void => {
    setValue(newValue as [number, number]);
    onCompleteActionCallback(newValue as [number, number]);
  };

  const customStyle = `
    .ant-slider {
      max-width: ${values?.styles?.maxWidth || "unset"}
    }
  `;

  const sliderProps = {
    disabled: values?.enabled === false,
    dots: values?.dots,
    max: values?.max,
    min: values?.min,
    onChange: handleChange,
    onChangeComplete: handleAfterChangeComplete,
    ref: rootRef,
    reverse: values?.reverse,
    step: steps,
    vertical: values?.vertical,
  };

  return (
    <>
      <style>{customStyle}</style>
      <EnsembleFormItem values={values}>
        {values?.range ? (
          <Slider
            {...sliderProps}
            defaultValue={values.initialValue as [number, number]}
            range
            value={value as [number, number]}
          />
        ) : (
          <Slider
            {...sliderProps}
            defaultValue={values?.initialValue as number}
            value={value as number}
          />
        )}
      </EnsembleFormItem>
    </>
  );
};

WidgetRegistry.register(widgetName, SliderWidget);
