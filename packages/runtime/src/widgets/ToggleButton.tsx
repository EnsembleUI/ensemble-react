import { isExpression, useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isString, isEmpty } from "lodash-es";
import MUIToggleButton from "@mui/material/ToggleButton";
import MUIToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Alert, Typography } from "antd";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  IconProps,
} from "../shared/types";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Icon } from "./Icon";

const widgetName = "ToggleButton";

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
  value: valueBinding,
  items,
  onChange,
  styles,
}) => {
  const [value, setValue] = useState<string | undefined>(
    isExpression(valueBinding) ? undefined : valueBinding,
  );
  const { values, rootRef } = useRegisterBindings(
    {
      value,
      valueBinding,
      styles,
      widgetName,
    },
    id,
    {
      setValue,
    },
  );

  useEffect(() => {
    setValue(values?.valueBinding);
  }, [values?.valueBinding]);

  // onchange action handler
  const action = useEnsembleAction(onChange);
  const onChangeCallback = useCallback(
    (newValue: string) => {
      action?.callback({
        value: newValue,
      });
    },
    [action?.callback],
  );

  // handle toggle button value change
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ): void => {
    if (!newValue) {
      return;
    }

    setValue(newValue);
    onChangeCallback(newValue);
  };

  const structuredItems = useMemo(() => {
    if (isEmpty(items)) {
      return [];
    }

    return items.map((item) => {
      return isString(item)
        ? { label: item, value: item }
        : { label: item.label, value: item.value, icon: item.icon };
    });
  }, [items]);

  if (isEmpty(structuredItems))
    return <Alert message="ToggleButton: items is required" type="error" />;

  return (
    <MUIToggleButtonGroup
      className={values?.styles?.names}
      exclusive
      onChange={handleChange}
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
            },
            "&.Mui-selected:hover": {
              backgroundColor: values?.styles?.selectedBackgroundColor,
              filter: "brightness(92%)",
            },
          }}
          value={item.value}
        >
          {item.icon && isString(item.icon.name) ? (
            <>
              <Icon {...item.icon} />
              &nbsp;
            </>
          ) : null}
          <Typography.Text
            style={{
              color:
                item.value === values?.value
                  ? values.styles?.selectedColor
                  : values?.styles?.color,
            }}
          >
            {item.label}
          </Typography.Text>
        </MUIToggleButton>
      ))}
    </MUIToggleButtonGroup>
  );
};

WidgetRegistry.register(widgetName, ToggleButton);
