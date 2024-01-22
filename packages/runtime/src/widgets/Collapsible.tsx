import { useCallback, useMemo, useState } from "react";
import {
  type Expression,
  unwrapWidget,
  useRegisterBindings,
  type EnsembleAction,
} from "@ensembleui/react-framework";
import { Collapse } from "antd";
import type { CollapseProps } from "antd";
import { get, isArray, isString } from "lodash-es";
import type { EnsembleWidgetProps, IconProps } from "../shared/types";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Icon } from "./Icon";

interface CollapsibleItem {
  key: Expression<string>;
  label: Expression<string> | Record<string, unknown>;
  children: Expression<string> | Record<string, unknown>;
}

export type CollapsibleProps = {
  items: CollapsibleItem[];
  expandIconPosition?: "start" | "end";
  value: Expression<string>[];
  onCollapse?: EnsembleAction;
  isAccordion?: boolean;
  collpaseIcon?: IconProps;
  expandIcon?: IconProps;
} & EnsembleWidgetProps;

export const Collapsible: React.FC<CollapsibleProps> = (props) => {
  const [activeValue, setActiveValue] = useState<string[]>(props.value);
  const { values } = useRegisterBindings({ ...props, activeValue }, props.id, {
    setActiveValue,
  });
  const onCollapseAction = useEnsembleAction(props.onCollapse);

  const collapsibleItems = useMemo(() => {
    const items = values?.items.map((item) => {
      return {
        ...item,
        label: isString(item.label)
          ? item.label
          : EnsembleRuntime.render([unwrapWidget(item.label)]),
        children: isString(item.children)
          ? item.children
          : EnsembleRuntime.render([unwrapWidget(item.children)]),
      };
    }) as CollapseProps["items"];

    return items;
  }, [values?.items]);

  // tweak the collapsible icons
  const expandIcon = (collapseStat: unknown) => {
    const isActive = get(collapseStat, "isActive");
    if (isActive && values?.expandIcon) {
      return (
        <Icon
          key={`${values?.id ?? ""}_${values.expandIcon.name}`}
          {...values.expandIcon}
        />
      );
    } else if (values?.collpaseIcon) {
      return (
        <Icon
          key={`${values?.id ?? ""}_${values.collpaseIcon.name}`}
          {...values.collpaseIcon}
        />
      );
    }
  };

  // trigger onCollapse action
  const onCallapseActionCallback = useCallback(
    (data: string | string[]) => {
      if (!onCollapseAction) {
        return;
      }

      return onCollapseAction.callback({ data });
    },
    [onCollapseAction],
  );

  // handle onchange on callpase
  const handleCollapsibleChange = (value: string | string[]): void => {
    setActiveValue(isArray(value) ? value : [value]);

    // trigger oncollapse action
    onCallapseActionCallback(value);
  };

  return (
    <Collapse
      accordion={values?.isAccordion}
      activeKey={activeValue}
      expandIcon={expandIcon}
      expandIconPosition={props?.expandIconPosition}
      items={collapsibleItems}
      onChange={handleCollapsibleChange}
    />
  );
};

WidgetRegistry.register("Collapsible", Collapsible);
