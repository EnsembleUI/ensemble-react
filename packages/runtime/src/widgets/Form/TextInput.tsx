import { Input, Form, ConfigProvider } from "antd";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type FormEvent,
  RefCallback,
} from "react";
import { runes } from "runes2";
import type { Rule } from "antd/es/form";
import { forEach } from "lodash-es";
import IMask, { InputMask } from "imask";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { TextStyles } from "../Text";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

const widgetName = "TextInput";

export type TextInputProps = {
  hintStyle?: TextStyles;
  labelStyle?: TextStyles;
  multiLine?: Expression<boolean>;
  maxLines?: number;
  maxLength?: Expression<number>;
  maxLengthEnforcement?: Expression<
    "none" | "enforced" | "truncateAfterCompositionEnds"
  >;
  inputType?: "email" | "phone" | "number" | "text" | "url"; //| "ipAddress";
  onChange?: EnsembleAction;
  mask?: string;
  validator?: {
    minLength?: number;
    maxLength?: number;
    regex?: string;
    regexError?: string;
    maskError?: string;
  };
} & EnsembleWidgetProps<TextStyles> &
  FormInputProps<string>;

export const TextInput: React.FC<TextInputProps> = (props) => {
  const [mask, setMask] = useState<InputMask>();
  const [value, setValue] = useState<string>();
  const maskRef = useRef<{ input: HTMLInputElement } | null>(null);

  const { values, rootRef } = useRegisterBindings(
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
  const action = useEnsembleAction(props.onChange);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      action?.callback({ value: newValue });
    },
    [action?.callback],
  );

  const handleRef: RefCallback<never> = (node) => {
    maskRef.current = node;
    rootRef(node);
  };

  const handleKeyDown = useCallback((e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/[^0-9.]/g, "");
  }, []);

  const handleInputPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pastedData = e.clipboardData.getData("text");
      if (mask) {
        mask.unmaskedValue = pastedData;
        handleChange(mask.value);
      }
    },
    [handleChange, mask],
  );

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

  useEffect(() => {
    if (values?.mask && maskRef.current) {
      const iMask = IMask(maskRef.current.input, {
        mask: values.mask.replace(/#/g, "0").replace(/A/g, "a"),
        lazy: true,
      });
      setMask(iMask);
    }
  }, [values?.mask]);

  const inputType = useMemo(() => {
    switch (values?.inputType) {
      case "email":
        return "email";
      case "phone":
        return "tel";
      case "number":
        return "tel";
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

    return `${pattern})$`;
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

    const regex = values?.validator?.regex;
    if (regex) {
      rulesArray.push({
        validator: (_, inputValue?: string) => {
          if (!inputValue || new RegExp(regex).test(inputValue || "")) {
            return Promise.resolve();
          }
          return Promise.reject(
            new Error(
              values.validator?.regexError || "The field has an invalid value",
            ),
          );
        },
      });
    }

    if (values?.mask && patternValue) {
      rulesArray.push({
        validator: (_, inputValue?: string) => {
          if (!inputValue || new RegExp(patternValue).test(inputValue)) {
            return Promise.resolve();
          }
          return Promise.reject(
            new Error(
              values.validator?.maskError ||
                `The value must be of the format ${values.mask || ""}`,
            ),
          );
        },
      });
    }

    return rulesArray;
  }, [
    values?.validator?.minLength,
    values?.validator?.maxLength,
    values?.validator?.regex,
    values?.validator?.regexError,
    values?.validator?.maskError,
    values?.mask,
    patternValue,
  ]);

  const maxLengthConfig = values?.maxLength
    ? {
        max: values.maxLength as number,
        show: true,
        exceedFormatter:
          values.maxLengthEnforcement === "none"
            ? undefined
            : (txt: string, { max }: { max: number }): string =>
                runes(txt).slice(0, max).join(""),
      }
    : undefined;

  return (
    <ConfigProvider
      theme={{ token: { colorTextPlaceholder: values?.hintStyle?.color } }}
    >
      <EnsembleFormItem rules={rules} valuePropName="value" values={values}>
        {values?.multiLine ? (
          <Input.TextArea
            count={maxLengthConfig}
            defaultValue={values.value}
            disabled={values.enabled === false}
            onChange={(event): void => setValue(event.target.value)}
            placeholder={values.hintText ?? ""}
            ref={rootRef}
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
            count={maxLengthConfig}
            defaultValue={values?.value}
            disabled={values?.enabled === false}
            onChange={(event): void => handleChange(event.target.value)}
            {...(values?.inputType === "number" && {
              onInput: (event): void => handleKeyDown(event),
            })}
            onPaste={handleInputPaste}
            placeholder={values?.hintText ?? ""}
            ref={handleRef}
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
    </ConfigProvider>
  );
};

WidgetRegistry.register(widgetName, TextInput);
