import React, { useCallback, useMemo } from "react";
import type { MenuProps } from "antd";
import { Dropdown as AntdDropdown } from "antd";
import {
  cloneDeep,
  get,
  isEmpty,
  isObject,
  isString,
  toNumber,
} from "lodash-es";
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
const DEFAULT_POPUPMENU_TRIGGER = "click";
const DEFAULT_POPUPMENUITEM_TYPE = "item";

interface PopupMenuItem {
  label: Expression<string> | { [key: string]: unknown };
  value: string;
  type?: "group" | "item";
  visible?: boolean;
  enabled?: boolean;
  items?: PopupMenuItem[];
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
  trigger?: "click" | "hover" | "contextMenu";
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

  const getMenuItem = useCallback(
    (rawItem: PopupMenuItem, index: string | number): ItemType | null => {
      if (rawItem.visible === false) {
        return null;
      }

      const menuItem: ItemType = {
        key: `popupmenu_item_${index}`,
        label: isString(rawItem.label)
          ? rawItem.label
          : EnsembleRuntime.render([unwrapWidget(rawItem.label)]),
        disabled: rawItem.enabled === false,
        ...(rawItem.items && {
          children: rawItem.items.map((itm, childIndex) =>
            getMenuItem(itm, `${index}_${childIndex}`),
          ),
        }),
        type: rawItem.type || DEFAULT_POPUPMENUITEM_TYPE,
      };
      return menuItem;
    },
    [],
  );

  const popupMenuItems = useMemo(() => {
    const popupItems: MenuProps["items"] = [];

    const items = values?.items;
    if (items) {
      const tempItems = items
        .map((rawItem, index) => getMenuItem(rawItem, index))
        .filter(Boolean);

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
    getMenuItem,
  ]);

  const getWidget = useCallback(() => {
    if (!values?.widget) {
      throw Error("PopupMenu requires a widget to render the anchor.");
    }
    const widget = cloneDeep(values.widget);
    const actualWidget = unwrapWidget(widget);
    return EnsembleRuntime.render([actualWidget]);
  }, [values?.widget]);

  const handleMenuItemClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key }) => {
      let item;
      if (key.includes("itemTemplate")) {
        const itemIndex = toNumber(key.split("_").at(-1));
        item = evaluatedNamedData.namedData[itemIndex];
      } else {
        const itemIndices = key.split("_").filter((_, i) => i > 1);
        if (itemIndices.length > 1) {
          for (let i = 1; i < itemIndices.length; i += 2) {
            itemIndices.splice(i, 0, "items");
          }
        }
        item = get(values?.items, itemIndices) as unknown;
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
        trigger={[values?.trigger || DEFAULT_POPUPMENU_TRIGGER]}
      >
        <div>{getWidget()}</div>
      </AntdDropdown>
    </div>
  );
};

WidgetRegistry.register(widgetName, PopupMenu);
