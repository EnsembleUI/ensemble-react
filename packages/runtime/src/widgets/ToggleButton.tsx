import { useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import { useCallback, useState } from "react";
import { isEqual, isNil, isString } from "lodash-es";
import MUIToggleButton from "@mui/material/ToggleButton";
import MUIToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Alert } from "antd";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  IconProps,
} from "../shared/types";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Text } from "./Text";
import { Icon } from "./Icon";

interface ToggleButtonPropsStyles {
  margin?: string;
  padding?: number;
  spacing?: number;
  runSpacing?: number;
  color?: Expression<string>;
  selectedColor?: Expression<string>;
  shadowColor?: Expression<string>;
  borderRadius?: number;
  backgroundColor?: Expression<string>;
  selectedBackgroundColor?: Expression<string>;
  borderColor?: Expression<string>;
  borderWidth?: number;
  selectedBorderColor?: Expression<string>;
  selectedBorderWidth?: number;
}

export type ToggleButtonProps = {
  value: string;
  items:
    | string[]
    | {
        value: string;
        label: string;
        icon?: IconProps;
      }[];
  onChange?: EnsembleAction;
} & EnsembleWidgetProps<ToggleButtonPropsStyles & EnsembleWidgetStyles>;

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  id,
  value: givenValue,
  items,
  onChange,
  styles,
}) => {
  const [value, setValue] = useState(givenValue);
  const { values, rootRef } = useRegisterBindings({ value, styles }, id, {
    setValue,
  });
  const action = useEnsembleAction(onChange);
  const onChangeCallback = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newValue: string) => {
      if (!action) {
        return;
      }

      if (!isNil(newValue) && !isEqual(value, newValue)) {
        setValue(newValue);

        action.callback({
          [id!]: {
            value: newValue,
            setValue,
          },
        });
      }
    },
    [action, id],
  );

  if (isNil(items))
    return <Alert message="ToggleButton: items is required" type="error" />;

  const structuredItems = structureItems(items);

  return (
    <MUIToggleButtonGroup
      className={values?.styles?.names}
      exclusive
      onChange={onChangeCallback}
      ref={rootRef}
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${structuredItems.length},1fr)`,
        rowGap: `${styles?.runSpacing ?? 0}px`,
        margin: `${styles?.margin ?? 0}`,
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
        ...values?.styles,
      }}
      value={values?.value}
    >
      {structuredItems.map((item, index) => (
        <MUIToggleButton
          key={item.value}
          sx={{
            padding: values?.styles?.padding,
            color: values?.styles?.color,
            backgroundColor: values?.styles?.backgroundColor,
            marginRight:
              index !== items.length - 1 ? `${styles?.spacing ?? 0}px` : 0,
            boxShadow: `1px 2px 5px 1px ${
              values?.styles?.shadowColor ?? "transparent"
            }`,
            textTransform: "none",
            border: `${styles?.borderWidth ?? 1}px solid ${
              values?.styles?.borderColor ?? "transparent"
            } !important`,
            borderRadius: `${values?.styles?.borderRadius ?? 4}px !important`,
            "&.Mui-selected": {
              color: values?.styles?.selectedColor,
              backgroundColor:
                values?.styles?.selectedBackgroundColor ??
                "rgba(0, 0, 0, 0.08)",
              borderColor: values?.styles?.selectedBorderColor,
              border: `${styles?.selectedBorderWidth ?? 1}px solid ${
                values?.styles?.selectedBorderColor ?? "transparent"
              } !important`,
              boxShadow: `1px 2px 5px 1px ${
                styles?.shadowColor ?? "transparent"
              }`,
              "& .ant-typography": {
                color: values?.styles?.selectedColor,
              },
            },
            "&.Mui-selected:hover": {
              backgroundColor: values?.styles?.selectedBackgroundColor,
              filter: "brightness(92%)",
            },
          }}
          value={item.value}
        >
          {item.icon && isString(item.icon.name) ? (
            <Icon {...item.icon} />
          ) : null}
          &nbsp;
          <Text text={item.label} />
        </MUIToggleButton>
      ))}
    </MUIToggleButtonGroup>
  );
};

WidgetRegistry.register("ToggleButton", ToggleButton);

const structureItems = (
  items: ToggleButtonProps["items"],
): Exclude<ToggleButtonProps["items"], string[]> =>
  items.map((item) => {
    return isString(item)
      ? { label: item, value: item }
      : { label: item.label, value: item.value, icon: item.icon };
  });
