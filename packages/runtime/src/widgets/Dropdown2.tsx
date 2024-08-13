import { Dropdown as AntDropdown } from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import {
  CustomScopeProvider,
  useRegisterBindings,
  useTemplateData,
  unwrapWidget,
  evaluate,
  defaultScreenContext,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  Expression,
} from "@ensembleui/react-framework";
import { get, isEmpty, isNull, isObject, isString } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
} from "../shared/types";
import { EnsembleRuntime } from "../runtime";
import type { HasBorder } from "../shared/hasSchema";

const widgetName = "Dropdown2";

type DropdownStyles = {
  dropdownBackgroundColor?: string;
  dropdownBorderRadius?: number;
  dropdownBorderColor?: string;
  dropdownBorderWidth?: number;
  dropdownMaxHeight?: string;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
} & HasBorder &
  EnsembleWidgetStyles;

interface SelectOption {
  label: Expression<string> | { [key: string]: unknown };
  value: Expression<string | number>;
}

type DropdownProps = {
  items?: SelectOption[];
  /* deprecated, use onChange */
  onItemSelect: EnsembleAction;
  onChange?: EnsembleAction;
  autoComplete: Expression<boolean>;
  hintStyle?: EnsembleWidgetStyles;
  manualClose?: boolean;
} & EnsembleWidgetProps<DropdownStyles> &
  HasItemTemplate & {
    "item-template"?: { value: Expression<string> };
  };

const Dropdown2: React.FC<DropdownProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const { "item-template": itemTemplate, ...rest } = props;

  const handleDropdownClose = (): void => {
    setIsOpen(false);
  };

  const handleSelectItem = ({ key }: { key: string }): void => {
    setSelectedValue(key);
  };

  const { rootRef, values } = useRegisterBindings(
    { ...rest, selectedValue, widgetName },
    props.id,
    {
      setSelectedValue,
      close: handleDropdownClose,
    },
  );

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const options = useMemo(() => {
    let dropdownOptions: MenuProps["items"] = [];

    if (values?.items) {
      const tempOptions = values.items.map((item) => {
        const labelContent = isString(item.label)
          ? item.label
          : EnsembleRuntime.render([unwrapWidget(item.label)]);
        return {
          key: item.value,
          label: labelContent,
        };
      });

      dropdownOptions = tempOptions;
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      const tempOptions = namedData.map((item: unknown) => {
        const value = evaluate<string | number>(
          defaultScreenContext,
          itemTemplate.value,
          {
            [itemTemplate.name]: get(item, itemTemplate.name) as unknown,
          },
        );

        const labelContent = (
          <CustomScopeProvider value={item as CustomScope}>
            {EnsembleRuntime.render([itemTemplate.template])}
          </CustomScopeProvider>
        );

        return {
          key: value,
          label: labelContent,
        };
      });

      dropdownOptions = [...(dropdownOptions || []), ...tempOptions];
    }

    return dropdownOptions;
  }, [values?.items, namedData, itemTemplate]);

  if (isNull(options)) {
    return null;
  }

  return (
    <div ref={rootRef} style={{ flex: 1 }}>
      <AntDropdown
        menu={{
          items: options,
          onClick: handleSelectItem,
          selectedKeys: [selectedValue],
        }}
        onOpenChange={(state): void =>
          setIsOpen(values?.manualClose ? true : state)
        }
        open={isOpen}
      >
        <button>Hello</button>
      </AntDropdown>
    </div>
  );
};

WidgetRegistry.register(widgetName, Dropdown2);
