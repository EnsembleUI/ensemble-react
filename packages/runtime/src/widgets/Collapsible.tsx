import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Expression,
  unwrapWidget,
  useRegisterBindings,
  type EnsembleAction,
  useTemplateData,
  useEvaluate,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import type { CollapseProps } from "antd";
import { Collapse, ConfigProvider } from "antd";
import { get, isArray, isString, mapKeys } from "lodash-es";
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

interface CollapsibleTemplate {
  key: Expression<string>;
  label: string | React.ReactNode[];
  children: React.ReactNode[];
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

const EvaluateItem = React.memo(
  ({
    context,
    template,
    currentIndex,
    setEvaluated,
  }: {
    context: object;
    currentIndex: number;
    template: {
      key: string;
      label: string | EnsembleWidget;
      children: EnsembleWidget;
    };
    setEvaluated: React.Dispatch<React.SetStateAction<CollapsibleTemplate[]>>;
  }): null => {
    const evaluatedData = useEvaluate({ ...template }, { context });

    useEffect(() => {
      const { key, label, children } = evaluatedData;

      setEvaluated((prev) => {
        prev[currentIndex] = {
          key,
          label: isString(label) ? label : EnsembleRuntime.render([label]),
          children: EnsembleRuntime.render([children]),
        };
        return [...prev];
      });
    }, [evaluatedData]);

    return null;
  },
);

EvaluateItem.displayName = "EvaluateItem";

const withValueTemplate = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) =>
  function Component(
    props: P & {
      items: CollapseProps["items"];
      namedData: object[];
      template: CollapsibleItem;
    },
  ): React.ReactElement {
    const { namedData, items = [] } = props;
    const [evaluated, setEvaluated] = useState<CollapsibleTemplate[]>([]);
    const template = useMemo(() => {
      const { key, label, children } = props.template;
      return {
        key,
        label: isString(label) ? label : unwrapWidget(label),
        children: unwrapWidget(children),
      };
    }, [props.template]);

    return (
      <>
        {namedData.map((context, index) => (
          <EvaluateItem
            context={context}
            currentIndex={index}
            key={index}
            setEvaluated={setEvaluated}
            template={template}
          />
        ))}
        <WrappedComponent {...props} items={[...items, ...evaluated]} />
      </>
    );
  };

const CollapsibleComponent = withValueTemplate(Collapse);

export const Collapsible: React.FC<CollapsibleProps> = (props) => {
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
          children: EnsembleRuntime.render([unwrapWidget(item.children)]),
        };
      });

      items.push(...tempItems);
    }

    return (items as CollapseProps["items"]) || [];
  }, [values?.items]);

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
      if (!onCollapseAction) return;
      onCollapseAction.callback({ data });
    },
    [onCollapseAction],
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
      <CollapsibleComponent
        accordion={values?.limitExpandedToOne || values?.isAccordion}
        activeKey={activeValue}
        expandIcon={expandIcon}
        expandIconPosition={props.expandIconPosition}
        items={collapsibleItems}
        namedData={namedData}
        onChange={handleCollapsibleChange}
        template={
          itemTemplate?.template.properties as unknown as CollapsibleItem
        }
      />
    </ConfigProvider>
  );
};

WidgetRegistry.register(widgetName, Collapsible);
WidgetRegistry.register("Accordion", Collapsible);
