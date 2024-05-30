import { Input, Form } from "antd";
import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useEffect, useMemo, useState } from "react";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { TextStyles } from "../Text";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";
import { Rule } from "antd/es/form";
import { forEach } from "lodash-es";

const widgetName = "TextInput";

export type TextInputProps = {
  hintStyle?: TextStyles;
  labelStyle?: TextStyles;
  multiLine?: Expression<boolean>;
  maxLines?: number;
  inputType?: "email" | "phone" | "number" | "text" | "url"; //| "ipAddress";
  mask?: string;
  validator?: {
    minLength?: number;
    maxLength?: number;
    regex?: string;
    regexError?: string;
  };
} & EnsembleWidgetProps<TextStyles> &
  FormInputProps<string>;

export const TextInput: React.FC<TextInputProps> = (props) => {
  const [value, setValue] = useState<string>();
  const { values } = useRegisterBindings(
    { ...props, initialValue: props.value, value, widgetName },
    props.id,
    {
      setValue,
    },
    {
      debounceMs: 300,
    },
  );
  const formInstance = Form.useFormInstance();

  useEffect(() => {
    setValue(values?.initialValue);
  }, [values?.initialValue]);

  useEffect(() => {
    if (formInstance && (values?.id || values?.label)) {
      formInstance.setFieldsValue({
        [values.id ?? values.label]: value,
      });
    }
  }, [value, formInstance, values?.id, values?.label]);

  const inputType = useMemo(() => {
    switch (values?.inputType) {
      case "email":
        return "email";
      case "phone":
        return "tel";
      case "number":
        return "number";
      case "url":
        return "url";
      default:
        return "text";
    }
  }, [values?.inputType]);

  const patternValue = useMemo((): string | undefined | RegExp => {
    if (!values?.mask) {
      return;
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern#overview
    const special = [
      "[",
      "]",
      "\\",
      "/",
      "^",
      "$",
      ".",
      "|",
      "?",
      "*",
      "+",
      "(",
      ")",
      "{",
      "}",
    ];

    let pattern = "^(?:";
    forEach(values.mask, (char) => {
      switch (char) {
        case "#":
          pattern += "[0-9]"; // Match any digit
          break;
        case "A":
          pattern += "[a-zA-Z]"; // Match any letter
          break;
        default:
          if (special.includes(char)) {
            pattern += `\\${char}`; // Escape special characters
          } else {
            pattern += char; // Include the character literally
          }
          break;
      }
    });

    return pattern + ")$";
  }, [values?.mask]);

  const rules = useMemo(() => {
    const rulesArray: Rule[] = [];

    if (values?.validator?.minLength) {
      rulesArray.push({
        min: values.validator.minLength,
        message: `The field  must be at least ${values.validator.minLength} characters long`,
      });
    }

    if (values?.validator?.maxLength) {
      rulesArray.push({
        max: values.validator.maxLength,
        message: `The field must be at most ${values.validator.maxLength} characters long`,
      });
    }

    if (values?.validator?.regex) {
      rulesArray.push({
        pattern: new RegExp(values.validator.regex),
        message: values.validator.regexError || "The field has invalid value",
      });
    }

    if (values?.mask && patternValue) {
      rulesArray.push({
        pattern: new RegExp(patternValue),
        message: `The value must be of the format ${values.mask}`,
      });
    }

    return rulesArray;
  }, [values?.validator, values?.mask]);

  return (
    <EnsembleFormItem valuePropName="value" values={values} rules={rules}>
      {values?.multiLine ? (
        <Input.TextArea
          defaultValue={values.value}
          disabled={values?.enabled === false}
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values.hintText ?? ""}
          rows={values.maxLines ? Number(values.maxLines) : 4} // Adjust the number of rows as needed
          style={{
            ...(values.styles ?? values.hintStyle),
            ...(values.styles?.visible === false
              ? { display: "none" }
              : undefined),
          }}
          value={values.value}
        />
      ) : (
        <Input
          defaultValue={values?.value}
          disabled={values?.enabled === false}
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ?? ""}
          style={{
            ...(values?.styles ?? values?.hintStyle),
            ...(values?.styles?.visible === false
              ? { display: "none" }
              : undefined),
          }}
          type={inputType}
          value={value}
        />
      )}
    </EnsembleFormItem>
  );
};

WidgetRegistry.register(widgetName, TextInput);
