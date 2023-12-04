import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { useCallback, useState } from "react";
import { isString } from "lodash-es";
import MUIToggleButton from "@mui/material/ToggleButton";
import MUIToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { EnsembleWidgetProps, IconProps } from "../shared/types";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Text } from "./Text";
import { Icon } from "./Icon";

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
  const { values } = useRegisterBindings({ value }, id, { setValue });
  const action = useEnsembleAction(onChange);

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ): void => {
    setValue(newValue);
    onChangeCallback(newValue);
  };

  const onChangeCallback = useCallback(
    (newValue: string) => {
      if (!action) {
        return;
      }
      action.callback({
        [id as string]: {
          value: newValue,
          setValue,
        },
      });
    },
    [action, id],
  );

  return (
    <MUIToggleButtonGroup
      value={values?.value}
      exclusive
      onChange={handleChange}
      sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: `${styles?.runSpacing ?? 0}px`,
        margin: `${styles?.margin ?? 0}px`,
      }}
    >
      {items.map((item, index) => (
        <MUIToggleButton
          value={isString(item) ? item : item.value}
          sx={{
            color: styles?.color,
            backgroundColor: styles?.backgroundColor,
            marginRight:
              index !== items.length - 1 ? `${styles?.spacing}px` : 0,
            boxShadow: `0 0 0 1px ${styles?.shadowColor}`,
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
              boxShadow: `0 0 0 1px ${styles?.shadowColor}`,
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
          {!isString(item) && isString(item?.icon?.name) && (
            <Icon {...item.icon!} />
          )}
          &nbsp;
          <Text text={isString(item) ? item : item.label} />
        </MUIToggleButton>
      ))}
    </MUIToggleButtonGroup>
  );
};

WidgetRegistry.register("ToggleButton", ToggleButton);
