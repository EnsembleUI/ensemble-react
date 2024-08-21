import React, { useCallback, useMemo } from "react";
import type { MenuProps } from "antd";
import { Dropdown as AntdDropdown } from "antd";
import { cloneDeep, isEmpty, isObject, isString, toNumber } from "lodash-es";
import {
  CustomScopeProvider,
  unwrapWidget,
  useEvaluate,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  Expression,
} from "@ensembleui/react-framework";
import type { ItemType } from "antd/es/menu/interface";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
} from "../shared/types";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";

const widgetName = "PopupMenu";

interface PopupMenuItem {
  label: Expression<string> | { [key: string]: unknown };
  value: string;
}

interface PopupMenuStyles {
  backgroundColor: string;
  borderRadius: string;
  borderColor: string;
  borderWidth: string;
}
export type PopupMenuProps = {
  items?: PopupMenuItem[];
  widget?: { [key: string]: unknown };
  onItemSelect?: EnsembleAction;
  showDivider?: boolean | Expression<string>;
  trigger?: "click" | "hover";
  enabled?: boolean;
} & EnsembleWidgetProps<PopupMenuStyles & EnsembleWidgetStyles> &
  HasItemTemplate & { "item-template"?: { value: Expression<string> } };

export const PopupMenu: React.FC<PopupMenuProps> = ({
  onItemSelect,
  "item-template": itemTemplate,
  ...rest
}) => {
  const { id, rootRef, values } = useRegisterBindings(
    { ...rest, widgetName },
    rest.id,
  );
  const action = useEnsembleAction(onItemSelect);

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const evaluatedNamedData = useEvaluate({ namedData });

  const popupMenuItems = useMemo(() => {
    const popupItems: MenuProps["items"] = [];

    const items = values?.items;
    if (items) {
      const tempItems = items.map((item, index) => {
        const itm: ItemType = {
          key: `popupmenu_item_${index}`,
          label: isString(item.label)
            ? item.label
            : EnsembleRuntime.render([unwrapWidget(item.label)]),
        };
        return itm;
      });

      popupItems.push(...tempItems);
    }

    if (isObject(itemTemplate) && !isEmpty(evaluatedNamedData.namedData)) {
      const tempItems = evaluatedNamedData.namedData.map((item, index) => {
        const itm: ItemType = {
          key: `popupmenu_itemTemplate_${index}`,
          label: (
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          ),
        };
        return itm;
      });

      popupItems.push(...tempItems);
    }

    if (values?.showDivider) {
      for (let i = 1; i < popupItems.length; i += 2) {
        popupItems.splice(i, 0, { type: "divider" });
      }
    }

    return popupItems;
  }, [
    values?.items,
    values?.showDivider,
    itemTemplate,
    evaluatedNamedData.namedData,
  ]);

  const getWidget = useCallback(() => {
    if (!values?.widget) {
      return null;
    }
    const widget = cloneDeep(values.widget);
    const actualWidget = unwrapWidget(widget);
    return EnsembleRuntime.render([actualWidget]);
  }, [values?.widget]);

  const handleMenuItemClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key }) => {
      const itemIndex = toNumber(key.at(-1));
      let item;
      if (key.includes("itemTemplate")) {
        item = evaluatedNamedData.namedData[itemIndex];
      } else {
        item = values?.items?.[itemIndex];
      }
      action?.callback({ value: item });
    },
    [action, evaluatedNamedData.namedData, values?.items],
  );

  return (
    <div ref={rootRef}>
      <AntdDropdown
        disabled={values?.enabled === false}
        menu={{
          id,
          items: popupMenuItems,
          onClick: handleMenuItemClick,
          style: { overflow: "auto", ...values?.styles },
        }}
        trigger={[values?.trigger || "click"]}
      >
        <div>{getWidget()}</div>
      </AntdDropdown>
    </div>
  );
};

WidgetRegistry.register(widgetName, PopupMenu);
