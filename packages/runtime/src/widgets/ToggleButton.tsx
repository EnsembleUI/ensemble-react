import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { useCallback, useState } from "react";
import { isEqual, isNil, isString } from "lodash-es";
import MUIToggleButton from "@mui/material/ToggleButton";
import MUIToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { EnsembleWidgetProps, IconProps } from "../shared/types";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Text } from "./Text";
import { Icon } from "./Icon";
import { Alert } from "antd";

interface ToggleButtonPropsStyles {
  margin?: number;
  spacing?: number;
  runSpacing?: number;
  color?: string;
  selectedColor?: string;
  shadowColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  selectedBackgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  selectedBorderColor?: string;
  selectedBorderWidth?: number;
}

type ToggleButtonProps = {
  value: string;
  items:
    | string[]
    | {
        value: string;
        label: string;
        icon?: IconProps;
      }[];
  onChange?: EnsembleAction;
} & EnsembleWidgetProps<ToggleButtonPropsStyles>;

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  id,
  value: givenValue,
  items,
  onChange,
  styles,
}) => {
  const [value, setValue] = useState(givenValue);
  const { values } = useRegisterBindings({ value, styles }, id, { setValue });
  const action = useEnsembleAction(onChange);
  const onChangeCallback = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newValue: string) => {
      if (!action) {
        return;
      }

      if (!isNil(newValue) && !isEqual(value, newValue)) {
        setValue(newValue);

        action.callback({
          [id as string]: {
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
      value={values?.value}
      exclusive
      onChange={onChangeCallback}
      sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: `${styles?.runSpacing ?? 0}px`,
        margin: `${styles?.margin ?? 0}px`,
      }}
    >
      {structuredItems.map((item, index) => (
        <MUIToggleButton
          value={item.value}
          key={item.value}
          sx={{
            color: styles?.color,
            backgroundColor: styles?.backgroundColor,
            marginRight:
              index !== items.length - 1 ? `${styles?.spacing ?? 0}px` : 0,
            boxShadow: `1px 2px 5px 1px ${
              styles?.shadowColor ?? "transparent"
            }`,
            border: `${styles?.borderWidth ?? 1}px solid ${
              styles?.borderColor ?? "transparent"
            } !important`,
            borderRadius: `${styles?.borderRadius ?? 4}px !important`,
            "&.Mui-selected": {
              color: styles?.selectedColor,
              backgroundColor:
                styles?.selectedBackgroundColor ?? "rgba(0, 0, 0, 0.08)",
              borderColor: styles?.selectedBorderColor,
              border: `${styles?.selectedBorderWidth ?? 1}px solid ${
                styles?.selectedBorderColor ?? "transparent"
              } !important`,
              boxShadow: `1px 2px 5px 1px ${
                styles?.shadowColor ?? "transparent"
              }`,
              "& .ant-typography": {
                color: styles?.selectedColor,
              },
            },
            "&.Mui-selected:hover": {
              backgroundColor: styles?.selectedBackgroundColor,
              filter: "brightness(92%)",
            },
          }}
        >
          {isString(item?.icon?.name) && <Icon {...item.icon!} />}
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
