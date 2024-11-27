import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import {
  CustomScopeProvider,
  useEvaluate,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import { Radio, Form } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { get, isEmpty, isObject, map } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetStyles, HasItemTemplate } from "../../shared/types";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../../runtime";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

const widgetName = "Radio";

const withValueTemplate = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) =>
  function Component(
    props: P & {
      templateValue?: Expression<string>;
    },
  ): React.ReactElement {
    const { templateValue } = props;
    const { evaluatedValue } = useEvaluate({
      evaluatedValue: templateValue,
    });

    if (!templateValue) {
      return <WrappedComponent {...props} />;
    }

    return <WrappedComponent {...props} value={evaluatedValue} />;
  };

export type RadioWidgetProps = FormInputProps<string> &
  HasItemTemplate & { "item-template"?: { value: Expression<string> } } & {
    items: {
      label: Expression<string>;
      value: Expression<string | number>;
      styles?: EnsembleWidgetStyles;
      enabled?: Expression<boolean>;
    }[];
    onChange?: EnsembleAction;
  };

interface RadioOptionsProps {
  disabled: boolean;
  value?: string | number;
  children: React.ReactElement | string;
  style: EnsembleWidgetStyles;
  scope: { [key: string]: unknown };
}

const RadioComponent = withValueTemplate(Radio);

export const RadioWidget: React.FC<RadioWidgetProps> = (props) => {
  const { "item-template": itemTemplate, onChange, ...rest } = props;
  const [value, setValue] = useState<string | number | undefined>(undefined);
  const { values, rootRef } = useRegisterBindings(
    { ...rest, initialValue: rest.value, value, widgetName },
    rest.id,
    { setValue },
  );

  // update initial value
  useEffect(() => {
    setValue(values?.initialValue);
  }, [values?.initialValue]);

  // update form field initial value
  const formInstance = Form.useFormInstance();

  useEffect(() => {
    if (formInstance) {
      formInstance.setFieldsValue({
        [values?.id ?? values?.label ?? ""]: value,
      });
    }
  }, [value, formInstance]);

  // onchange ensemble action
  const onChangeAction = useEnsembleAction(onChange);

  // handle onchange of radio
  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onChangeAction?.callback({ value: newValue });
    },
    [onChangeAction?.callback],
  );

  // extract template data
  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  // handle radio items
  const radioItems = useMemo(() => {
    const radioOptions: RadioOptionsProps[] = [];

    const getStyle = (styles: EnsembleWidgetStyles): object => ({
      ...styles,
      ...(styles?.visible === false ? { display: "none" } : undefined),
    });

    if (values?.items) {
      values.items.forEach((scope) => {
        radioOptions.push({
          scope,
          children: scope.label,
          disabled: values.enabled === false || scope.enabled === false,
          value: scope.value,
          style: getStyle(scope.styles as object),
        });
      });
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      map(namedData, (scope: { [key: string]: unknown }) => {
        const typedItem = get(scope, itemTemplate.name) as {
          [key: string]: unknown;
        };
        radioOptions.push({
          scope,
          disabled: values?.enabled === false,
          children: <>{EnsembleRuntime.render([itemTemplate.template])}</>,
          style: getStyle(typedItem.styles as object),
        });
      });
    }

    return radioOptions.map((option: RadioOptionsProps) => {
      return (
        <CustomScopeProvider key={option.value} value={option.scope}>
          <RadioComponent {...option} templateValue={itemTemplate?.value} />
        </CustomScopeProvider>
      );
    });
  }, [values?.items, values?.enabled, itemTemplate, namedData]);

  return (
    <EnsembleFormItem values={values}>
      <Radio.Group
        onChange={(event): void => handleChange(String(event.target.value))}
        ref={rootRef}
        style={values?.styles}
        value={String(values?.value)}
      >
        {radioItems}
      </Radio.Group>
    </EnsembleFormItem>
  );
};

WidgetRegistry.register(widgetName, RadioWidget);
