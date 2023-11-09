import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { InputOTP } from "antd-input-otp";
import { useState } from "react";
import { Form } from "antd";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/utils";
import type { TextStyles } from "./Text";

interface ConfirmationInputStyles {
  inputType?: "number" | "text";
  fieldWidth?: number | string;
  fieldHeight?: number | string;
  gap?: number;
  spaceEvenly?: boolean;
  defaultFieldBorderColor?: string;
  activeFieldBorderColor?: string;
  filledFieldBorderColor?: string;
  defaultFieldBackgroundColor?: string;
  activeFieldBackgroundColor?: string;
  filledFieldBackgroundColor?: string;
  textStyle?: TextStyles;

  backgroundColor?: string;
  margin?: number | string;
  padding?: number | string;

  [key: string]: unknown;
}

const defaultStyles: ConfirmationInputStyles = {
  inputType: "number",
  fieldWidth: 50,
  fieldHeight: 50,
  gap: 10,
  spaceEvenly: true,
  defaultFieldBorderColor: "rgba(0, 0, 0, 0.451)",
  activeFieldBorderColor: "black",
  filledFieldBorderColor: "transparent",
  defaultFieldBackgroundColor: "transparent",
  activeFieldBackgroundColor: "transparent",
  filledFieldBackgroundColor: "transparent",
  textStyle: {
    color: "black",
    fontFamily: "inherit",
    fontSize: 25,
    fontWeight: "bold",
    backgroundColor: "transparent",
  },

  backgroundColor: "transparent",
  margin: 0,
  padding: 0,
};

type ConfirmationInputProps = {
  length?: number;
  onChange?: EnsembleAction;
  onComplete?: EnsembleAction;
} & EnsembleWidgetProps<ConfirmationInputStyles>;

export const ConfirmationInput: React.FC<ConfirmationInputProps> = (props) => {
  const { id, length, onChange, onComplete, styles, ...otherProps } = props;

  const [form] = Form.useForm();

  const [text, setText] = useState("");

  const onChangeAction = useEnsembleAction(onChange);
  const onCompleteAction = useEnsembleAction(onComplete);

  useRegisterBindings({ text }, id, { setText });

  const handleChange = (value: string[]): void => {
    setText(value.join(""));

    onChangeAction?.callback({
      [id as string]: {
        text: value.join(""),
        setText,
      },
    });
  };

  const handleComplete = (values: Record<string, string[]>): unknown =>
    onCompleteAction?.callback({
      [id as string]: {
        text: values["confirmationItem"].join(""),
        setText,
      },
    });

  const customStyles = `
      .confirmationInput:focus {
        border-color: ${
          styles?.activeFieldBorderColor || defaultStyles.activeFieldBorderColor
        } !important;
        background-color: ${
          styles?.activeFieldBackgroundColor ||
          defaultStyles.activeFieldBackgroundColor
        } !important;
      }

      .confirmationinput[value]:not([value=""]):not(.confirmationinput:where(.ant-input:focus), .confirmationinput:where(.ant-input-focused)) {
        border-color: ${
          styles?.filledFieldBorderColor || defaultStyles.filledFieldBorderColor
        } !important;
        background-color: ${
          styles?.filledFieldBackgroundColor ||
          defaultStyles.filledFieldBackgroundColor
        } !important;
      }
    `;

  return (
    <>
      <style>{customStyles}</style>
      <Form form={form} onFinish={handleComplete}>
        <Form.Item name="confirmationItem">
          <InputOTP
            length={length || 4}
            onChange={handleChange}
            autoSubmit={form}
            inputType={styles?.inputType === "text" ? "all" : "numeric"}
            inputClassName="confirmationInput"
            wrapperStyle={{
              backgroundColor:
                styles?.backgroundColor || defaultStyles.backgroundColor,
              margin: styles?.margin || defaultStyles.margin,
              padding: styles?.padding || defaultStyles.padding,
              gap:
                styles?.gap && !styles?.spaceEvenly
                  ? styles?.gap
                  : defaultStyles.gap,
              ...(styles?.spaceEvenly && {
                flex: 1,
                alignItems: "center",
                justifyContent: "space-evenly",
              }),
            }}
            inputStyle={{
              padding: 0,
              margin: 0,
              width: styles?.fieldWidth || defaultStyles.fieldWidth,
              height: styles?.fieldHeight || defaultStyles.fieldHeight,
              borderColor:
                styles?.defaultFieldBorderColor ||
                defaultStyles.defaultFieldBorderColor,
              backgroundColor:
                styles?.defaultFieldBackgroundColor ||
                defaultStyles.defaultFieldBackgroundColor,
              fontFamily:
                styles?.textStyle?.fontFamily ||
                defaultStyles.textStyle?.fontFamily,
              fontSize:
                styles?.textStyle?.fontSize ||
                defaultStyles.textStyle?.fontSize,
              fontWeight:
                styles?.textStyle?.fontWeight ||
                defaultStyles.textStyle?.fontWeight,
              color: styles?.textStyle?.color || defaultStyles.textStyle?.color,
            }}
            {...otherProps}
          />
        </Form.Item>
      </Form>
    </>
  );
};

WidgetRegistry.register("ConfirmationInput", ConfirmationInput);
