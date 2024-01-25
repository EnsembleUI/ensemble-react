import { useCallback, useMemo, useState } from "react";
import {
  type Expression,
  unwrapWidget,
  useRegisterBindings,
  type EnsembleAction,
  useTemplateData,
  CustomScopeProvider,
  type CustomScope,
  evaluate,
  defaultScreenContext,
} from "@ensembleui/react-framework";
import { Collapse, type CollapseProps, ConfigProvider } from "antd";
import { get, isArray, isEmpty, isObject, isString } from "lodash-es";
import type {
  EnsembleWidgetProps,
  HasItemTemplate,
  IconProps,
} from "../shared/types";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Icon } from "./Icon";

interface CollapsibleItem {
  key: Expression<string>;
  label: Expression<string> | Record<string, unknown>;
  children: Expression<string> | Record<string, unknown>;
}

interface CollapsibleHeaderStyles {
  headerBg?: string;
  headerPadding?: undefined | string | number;
}

interface CollapsibleContentStyles {
  contentBg?: string;
  contentPadding?: undefined | string | number;
}

export type CollapsibleProps = {
  items?: CollapsibleItem[];
  expandIconPosition?: "start" | "end";
  value: Expression<string>[];
  onCollapse?: EnsembleAction;
  isAccordion?: boolean;
  collpaseIcon?: IconProps;
  expandIcon?: IconProps;
  headerStyle?: CollapsibleHeaderStyles;
  contentStyle?: CollapsibleContentStyles;
} & EnsembleWidgetProps &
  HasItemTemplate;

export const Collapsible: React.FC<CollapsibleProps> = (props) => {
  const { "item-template": itemTemplate, ...rest } = props;
  const [activeValue, setActiveValue] = useState<string[]>(props.value);
  const { values } = useRegisterBindings({ ...rest, activeValue }, props.id, {
    setActiveValue,
  });
  const onCollapseAction = useEnsembleAction(props.onCollapse);
  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const collapsibleItems = useMemo(() => {
    const items = [];
    if (values?.items) {
      const tempItems = values.items.map((item) => {
        return {
          ...item,
          label: isString(item.label)
            ? item.label
            : EnsembleRuntime.render([unwrapWidget(item.label)]),
          children: isString(item.children)
            ? item.children
            : EnsembleRuntime.render([unwrapWidget(item.children)]),
        };
      });

      items.push(...tempItems);
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      const collapsibleTemplate = JSON.stringify(
        itemTemplate.template.properties,
      );

      const tempItems = namedData.map((item) => {
        const evaluatedConfig = evaluate<CollapsibleItem>(
          defaultScreenContext,
          collapsibleTemplate
            .toString()
            // eslint-disable-next-line prefer-named-capture-group
            .replace(/['"]\$\{([^}]*)\}['"]/g, "$1"), // replace "${...}" or '${...}' with ...
          {
            [itemTemplate.name]: get(item, itemTemplate.name) as unknown,
          },
        );

        return {
          ...item,
          key: evaluatedConfig.key,
          label: isString(itemTemplate.template.properties.label) ? (
            evaluatedConfig.label
          ) : (
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([
                unwrapWidget(
                  itemTemplate.template.properties.label as Record<
                    string,
                    unknown
                  >,
                ),
              ])}
            </CustomScopeProvider>
          ),
          children: isString(itemTemplate.template.properties.children) ? (
            evaluatedConfig.children
          ) : (
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([
                unwrapWidget(
                  itemTemplate.template.properties.children as Record<
                    string,
                    unknown
                  >,
                ),
              ])}
            </CustomScopeProvider>
          ),
        };
      });

      items.push(...tempItems);
    }

    return items as CollapseProps["items"];
  }, [values?.items, itemTemplate, namedData]);

  // tweak the collapsible icons
  const expandIcon = (collapseStat: unknown) => {
    const isActive = get(collapseStat, "isActive");
    const idKey = values?.id ?? "";

    const iconName = isActive
      ? "default_collapsed_icon"
      : "default_expand_icon";
    const iconProps = isActive ? values?.expandIcon : values?.collpaseIcon;

    return (
      <Icon
        key={`${idKey}_${iconName}`}
        name={isActive ? "KeyboardArrowDown" : "KeyboardArrowRight"}
        {...iconProps}
      />
    );
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
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            ...values?.headerStyle,
            ...values?.contentStyle,
          },
        },
      }}
    >
      <Collapse
        accordion={values?.isAccordion}
        activeKey={activeValue}
        expandIcon={expandIcon}
        expandIconPosition={props.expandIconPosition}
        items={collapsibleItems}
        onChange={handleCollapsibleChange}
      />
    </ConfigProvider>
  );
};

WidgetRegistry.register("Collapsible", Collapsible);
