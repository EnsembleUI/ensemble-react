import React, { useEffect, useMemo, useState } from "react";
import { Menu, Dropdown as AntdDropdown } from "antd";
import { cloneDeep, get, isEmpty, isObject } from "lodash-es";
import {
  CustomScopeProvider,
  defaultScreenContext,
  evaluate,
  unwrapWidget,
  useTemplateData,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  EnsembleWidget,
  Expression,
} from "@ensembleui/react-framework";
import type { EnsembleWidgetProps, HasItemTemplate } from "../shared/types";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";

interface PopupMenuItem {
  label: string;
  value: string;
}

interface PopupMenuStyles {
  backgroundColor: string;
  borderRadius: string;
  borderColor: string;
  borderWidth: string;
}
type PopupMenuProps = {
  [key: string]: unknown;
  items?: PopupMenuItem[];
  widget?: Record<string, unknown>;
  onItemSelect?: EnsembleAction;
} & EnsembleWidgetProps<PopupMenuStyles> &
  HasItemTemplate & { "item-template"?: { value: Expression<string> } };

export const PopupMenu: React.FC<PopupMenuProps> = (props) => {
  const { "item-template": itemTemplate } = props;
  const action = useEnsembleAction(props.onItemSelect);
  const [widgetProps, setWidgetProps] = useState<EnsembleWidget>();

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const popupMenuItems = useMemo(() => {
    const popupItems = [];

    if (props?.items) {
      const tempItems = props.items.map((item) => {
        return (
          <Menu.Item key={item.value} onClick={() => action?.callback(item)}>
            {item.label}
          </Menu.Item>
        );
      });

      popupItems.push(...tempItems);
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      const tempItems = namedData.map((item) => {
        const value = evaluate<string | number>(
          defaultScreenContext,
          itemTemplate.value,
          {
            [itemTemplate.name]: get(item, itemTemplate.name) as unknown,
          },
        );

        return (
          <Menu.Item key={value} onClick={() => action?.callback(item)}>
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          </Menu.Item>
        );
      });

      popupItems.push(...tempItems);
    }

    return <Menu>{popupItems}</Menu>;
  }, [props?.items, action, namedData, itemTemplate]);

  useEffect((): void => {
    if (!props.widget) {
      return;
    }
    // clone value so we're not updating the yaml doc
    const widget = cloneDeep(props.widget);
    const actualWidget = unwrapWidget(widget);
    setWidgetProps(actualWidget);
    // Only run once
  }, []);

  return (
    <>
      <AntdDropdown overlay={popupMenuItems} trigger={["click"]}>
        <div>{widgetProps ? EnsembleRuntime.render([widgetProps]) : null}</div>
      </AntdDropdown>
      {action && "Modal" in action ? action.Modal : null}
    </>
  );
};

WidgetRegistry.register("PopupMenu", PopupMenu);
