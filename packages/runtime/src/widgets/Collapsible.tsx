import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Expression,
  unwrapWidget,
  useRegisterBindings,
  type EnsembleAction,
  useTemplateData,
  useEvaluate,
  CustomScopeProvider,
  type CustomScope,
} from "@ensembleui/react-framework";
import type { CollapseProps } from "antd";
import { Collapse, ConfigProvider } from "antd";
import { get, isArray, isEmpty, isString, mapKeys } from "lodash-es";
import type {
  EnsembleWidgetProps,
  HasItemTemplate,
  IconProps,
} from "../shared/types";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Icon } from "./Icon";

const widgetName = "Collapsible";

interface CollapsibleItem {
  key: Expression<string>;
  label: Expression<string> | { [key: string]: unknown };
  children: Expression<string> | { [key: string]: unknown };
}

interface CollapsibleHeaderStyles {
  /** The background color of the header */
  headerBg?: string;
  /** The padding of the header */
  headerPadding?: undefined | string | number;
  /** The color of the text in the header */
  textColor?: string;
  /** The color of the border */
  borderColor?: string;
  /** The width of the border line */
  borderWidth?: number;
}

interface CollapsibleContentStyles {
  contentBg?: string;
  contentPadding?: undefined | string | number;
}

export type CollapsibleProps = {
  /** The items to be displayed in the Collapsible widget */
  items?: CollapsibleItem[];
  /** The position of the expand icon (either "start" or "end") */
  expandIconPosition?: "start" | "end";
  value: Expression<string>[];
  /** Perform an action when the Collapsible widget is collapsed */
  onCollapse?: EnsembleAction;
  /** If true, only one panel can be expanded at a time */
  isAccordion?: boolean;
  /** If true, only one panel can be expanded at a time */
  limitExpandedToOne?: boolean;
  /** The Icon displayed when the Collapsible widget is collapsed */
  collapseIcon?: IconProps;
  /** The Icon displayed when the Collapsible widget is expanded */
  expandIcon?: IconProps;
  /** Add one of the following 5 styles to the header: headerBg, headerPadding, textColor, borderColor, borderWidth */
  headerStyle?: CollapsibleHeaderStyles;
  /** Add one of the following 2 styles to the content of the Collapsible widget: contentBg, contentPadding */
  contentStyle?: CollapsibleContentStyles;
} & EnsembleWidgetProps &
  HasItemTemplate;

const CollapseItem = ({
  context,
  currentIndex,
  template,
  setEvaluatedKeys,
}: {
  context: object;
  currentIndex: number;
  template: { [key: string]: string };
  setEvaluatedKeys: React.Dispatch<React.SetStateAction<string[]>>;
}): null => {
  const { key } = useEvaluate({ ...template }, { context });

  useEffect(() => {
    setEvaluatedKeys((prev) => {
      prev[currentIndex] = key;
      return [...prev];
    });
  }, [key, setEvaluatedKeys]);

  return null;
};

export const Collapsible: React.FC<CollapsibleProps> = (props) => {
  const { "item-template": itemTemplate, ...rest } = props;
  const [activeValue, setActiveValue] = useState<string[]>(props.value);
  const [evaluatedKeys, setEvaluatedKeys] = useState<string[]>([]);
  const template = itemTemplate?.template
    .properties as unknown as CollapsibleItem;

  const { values } = useRegisterBindings(
    { ...rest, activeValue, widgetName },
    props.id,
    {
      setActiveValue,
    },
  );
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
          children: EnsembleRuntime.render([unwrapWidget(item.children)]),
        };
      });
      items.push(...tempItems);
    }
    return (items as CollapseProps["items"]) || [];
  }, [values?.items]);

  const templateItems = useMemo(() => {
    const items = [];
    if (!isEmpty(namedData) && evaluatedKeys.length === namedData.length) {
      const tempItems = namedData.map((scope, index) => ({
        key: evaluatedKeys[index],
        label: (
          <CustomScopeProvider value={{ ...scope, index } as CustomScope}>
            {EnsembleRuntime.render([
              isString(template.label)
                ? template.label
                : unwrapWidget(template.label),
            ])}
          </CustomScopeProvider>
        ),
        children: (
          <CustomScopeProvider value={{ ...scope, index } as CustomScope}>
            {EnsembleRuntime.render([unwrapWidget(template.children)])}
          </CustomScopeProvider>
        ),
      }));
      items.push(...tempItems);
    }
    return (items as CollapseProps["items"]) || [];
  }, [evaluatedKeys, namedData, template]);

  // tweak the collapsible icons
  const expandIcon = (collapseStat: unknown) => {
    const isActive = get(collapseStat, "isActive");
    const idKey = values?.id ?? "";

    const iconName = isActive
      ? "default_collapsed_icon"
      : "default_expand_icon";
    const iconProps = isActive ? values?.expandIcon : values?.collapseIcon;

    return (
      <Icon
        key={`${idKey}_${iconName}`}
        name={isActive ? "KeyboardArrowDown" : "KeyboardArrowRight"}
        {...iconProps}
      />
    );
  };

  const onCollapseActionCallback = useCallback(
    (data: string | string[]) => {
      onCollapseAction?.callback({ data });
    },
    [onCollapseAction?.callback],
  );

  // handle onchange on collapse
  const handleCollapsibleChange = (value: string | string[]): void => {
    setActiveValue(isArray(value) ? value : [value]);
    // trigger on collapse action
    onCollapseActionCallback(value);
  };

  // Since I did not like the default names of the properties in the ant design Collapse component,
  // I changed them to more meaningful names, and this means I need to rename the keys.
  const getHeaderStyles = (
    headerStyle: CollapsibleHeaderStyles | undefined,
  ): CollapsibleHeaderStyles => {
    if (typeof headerStyle === "undefined") return {};
    return mapKeys(headerStyle, (_, key) => {
      if (key === "textColor") return "colorTextHeading";
      if (key === "borderColor") return "colorBorder";
      if (key === "borderWidth") return "lineWidth";
      return key;
    });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            ...getHeaderStyles(values?.headerStyle),
            ...values?.contentStyle,
          },
        },
      }}
    >
      {namedData.map((context, index) => (
        <CollapseItem
          context={context}
          currentIndex={index}
          key={index}
          setEvaluatedKeys={setEvaluatedKeys}
          template={{ key: template.key }}
        />
      ))}
      <Collapse
        accordion={values?.limitExpandedToOne || values?.isAccordion}
        activeKey={activeValue}
        expandIcon={expandIcon}
        expandIconPosition={props.expandIconPosition}
        items={[...collapsibleItems, ...templateItems]}
        onChange={handleCollapsibleChange}
      />
    </ConfigProvider>
  );
};

WidgetRegistry.register(widgetName, Collapsible);
WidgetRegistry.register("Accordion", Collapsible);
