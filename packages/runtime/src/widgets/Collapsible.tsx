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
  useScreenContext,
  type ScreenContextDefinition,
  createEvaluationContext,
  useCustomScope,
  useEnsembleStorage,
  useApplicationContext,
} from "@ensembleui/react-framework";
import { Collapse, type CollapseProps, ConfigProvider } from "antd";
import {
  get,
  isArray,
  isEmpty,
  isObject,
  isString,
  mapKeys,
  merge,
} from "lodash-es";
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

export const Collapsible: React.FC<CollapsibleProps> = (props) => {
  const screenContext = useScreenContext();
  const parentScope = useCustomScope();
  const storage = useEnsembleStorage();
  const applicationContext = useApplicationContext();
  const { "item-template": itemTemplate, ...rest } = props;
  const [activeValue, setActiveValue] = useState<string[]>(props.value);
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
          screenContext as ScreenContextDefinition,
          collapsibleTemplate
            .toString()
            // eslint-disable-next-line prefer-named-capture-group
            .replace(/['"]\$\{([^}]*)\}['"]/g, "$1"), // replace "${...}" or '${...}' with ...
          createEvaluationContext({
            applicationContext: merge({}, applicationContext),
            screenContext: screenContext ?? {},
            ensemble: {
              storage,
            },
            context: {
              ...parentScope,
              [itemTemplate.name]: get(item, itemTemplate.name) as unknown,
            },
          }),
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
                  itemTemplate.template.properties.label as {
                    [key: string]: unknown;
                  },
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
                  itemTemplate.template.properties.children as {
                    [key: string]: unknown;
                  },
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
    const iconProps = isActive ? values?.expandIcon : values?.collapseIcon;

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
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(e) => e.stopPropagation()}>
        <Collapse
          accordion={values?.limitExpandedToOne || values?.isAccordion}
          activeKey={activeValue}
          expandIcon={expandIcon}
          expandIconPosition={props.expandIconPosition}
          items={collapsibleItems}
          onChange={handleCollapsibleChange}
        />
      </div>
    </ConfigProvider>
  );
};

WidgetRegistry.register(widgetName, Collapsible);
WidgetRegistry.register("Accordion", Collapsible);
