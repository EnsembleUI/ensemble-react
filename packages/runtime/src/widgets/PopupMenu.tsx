import React, { useCallback, useMemo, memo, useState } from "react";
import type { MenuProps } from "antd";
import { Dropdown as AntdDropdown } from "antd";
import { isEmpty, isObject, isString, compact, join, tail } from "lodash-es";
import {
  CustomScopeProvider,
  unwrapWidget,
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
  onTriggered?: EnsembleAction;
  enabled?: boolean;
} & EnsembleWidgetProps<PopupMenuStyles & EnsembleWidgetStyles> &
  HasItemTemplate & { "item-template"?: { value: Expression<string> } };

// memoized component for rendering menu item labels to prevent expensive re-renders
const MenuItemLabel = memo<{
  label: Expression<string> | { [key: string]: unknown };
  hasBeenOpened: boolean;
  isContextMenu: boolean;
}>(({ label, hasBeenOpened, isContextMenu }) => {
  if (isString(label)) {
    return <span>{label}</span>;
  }

  // for context menus, render immediately
  // for other triggers, only render complex widgets after menu has been opened
  if (!hasBeenOpened && !isContextMenu) {
    return <span style={{ opacity: 0.6 }}>...</span>;
  }

  return <>{EnsembleRuntime.render([unwrapWidget(label)])}</>;
});
MenuItemLabel.displayName = "MenuItemLabel";

export const PopupMenu: React.FC<PopupMenuProps> = ({
  onTriggered,
  onItemSelect,
  "item-template": itemTemplate,
  ...rest
}) => {
  const { id, rootRef, values } = useRegisterBindings(
    { ...rest, widgetName },
    rest.id,
  );
  const action = useEnsembleAction(onItemSelect);
  const onTriggerAction = useEnsembleAction(onTriggered);

  // track if menu has been opened to enable lazy rendering
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  // for context menus, we need to detect when they're opened differently
  const isContextMenu = values?.trigger === "contextMenu";

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const getMenuItem = useCallback(
    (rawItem: PopupMenuItem, index: string | number): ItemType | null => {
      if (rawItem.visible === false) {
        return null;
      }

      const menuItem: ItemType = {
        key: `popupmenu_item_${index}`,
        label: (
          <MenuItemLabel
            label={rawItem.label}
            hasBeenOpened={hasBeenOpened}
            isContextMenu={isContextMenu}
          />
        ),
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
    [hasBeenOpened, isContextMenu],
  );

  const templateItems = useMemo(() => {
    if (!isObject(itemTemplate) || isEmpty(namedData)) {
      return [];
    }

    return namedData.map((item, index) => {
      const itm: ItemType = {
        key: `popupmenu_itemTemplate_${index}`,
        label:
          hasBeenOpened || isContextMenu ? (
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          ) : (
            <span style={{ opacity: 0.6 }}>...</span>
          ),
      };
      return itm;
    });
  }, [itemTemplate, namedData, hasBeenOpened, isContextMenu]);

  const regularItems = useMemo(() => {
    const items = values?.items;
    if (!items || items.length === 0) {
      return [];
    }

    return compact(items.map((rawItem, index) => getMenuItem(rawItem, index)));
  }, [values?.items, getMenuItem]);

  const popupMenuItems = useMemo(() => {
    const popupItems: MenuProps["items"] = [...regularItems, ...templateItems];

    if (values?.showDivider && popupItems.length > 1) {
      for (let i = 1; i < popupItems.length; i += 2) {
        popupItems.splice(i, 0, { type: "divider" });
      }
    }

    return popupItems;
  }, [regularItems, templateItems, values?.showDivider]);

  const widgetToRender = useMemo(() => {
    if (!values?.widget) {
      throw Error("PopupMenu requires a widget to render the anchor.");
    }
    const actualWidget = unwrapWidget(values.widget);
    return EnsembleRuntime.render([actualWidget]);
  }, [values?.widget]);

  const itemsMap = useMemo(() => {
    const map = new Map<string, PopupMenuItem>();

    if (namedData.length > 0) {
      namedData.forEach((item, index) => {
        map.set(`itemTemplate_${index}`, item as PopupMenuItem);
      });
    }

    if (values?.items && values.items.length > 0) {
      const traverseItems = (
        items: PopupMenuItem[],
        path: number[] = [],
      ): void => {
        items.forEach((item, index) => {
          const newPath = [...path, index];
          map.set(`item_${newPath.join("_")}`, item);
          if (item.items && item.items.length > 0) {
            // handle nested items
            traverseItems(item.items, newPath);
          }
        });
      };
      traverseItems(values.items);
    }
    return map;
  }, [namedData, values?.items]);

  const handleMenuItemClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      const mapKey = join(tail(key.split("_")), "_");
      const item = itemsMap.get(mapKey);
      action?.callback({ value: item });
    },
    [action?.callback, itemsMap],
  );

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setHasBeenOpened(true);
        if (onTriggerAction?.callback) {
          onTriggerAction.callback({ open });
        }
      }
    },
    [onTriggerAction?.callback],
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
        onOpenChange={handleOnOpenChange}
        trigger={[values?.trigger || DEFAULT_POPUPMENU_TRIGGER]}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>{widgetToRender}</div>
      </AntdDropdown>
    </div>
  );
};

WidgetRegistry.register(widgetName, PopupMenu);
