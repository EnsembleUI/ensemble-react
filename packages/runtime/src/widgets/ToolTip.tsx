import { ConfigProvider, Tooltip } from "antd";
import {
  type EnsembleAction,
  type Expression,
  unwrapWidget,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { cloneDeep } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { type Widget } from "../shared/coreSchema";
import { EnsembleRuntime } from "../runtime";
import { type EnsembleWidgetProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks";
import { useMemo } from "react";

const widgetName = "ToolTip";

export type ToolTipProps = {
  message: Expression<string>;
  preferBelow?: boolean;
  waitDuration?: number;
  showDuration?: number;
  onTriggered?: EnsembleAction;
  /**
   * The widget to render as the content of this container.
   * @treeItemWidgetLabel Set Content Widget
   */
  widget: Widget;
} & EnsembleWidgetProps;

export const ToolTip: React.FC<ToolTipProps> = (props) => {
  const { widget, onTriggered, ...rest } = props;
  const unwrappedWidget = useMemo(() => {
    return unwrapWidget(cloneDeep(widget));
  }, [widget]);
  const action = useEnsembleAction(onTriggered);

  const { values, rootRef } = useRegisterBindings({ ...rest }, props.id);

  const handleTooltipTriggered = (open: boolean) => {
    action?.callback({ tooltipState: open });
  };

  const styleTokens = useMemo(() => {
    const { fontFamily, fontSize, lineHeight, color } = values?.styles || {};

    return {
      ...(fontFamily && { fontFamily }),
      ...(fontSize && { fontSize: fontSize as number }),
      ...(lineHeight && { lineHeight: lineHeight as number }),
      ...(color && { colorText: color }),
    };
  }, [values?.styles]);

  return (
    <ConfigProvider
      theme={{
        token: styleTokens,
      }}
    >
      <Tooltip
        color={values?.styles?.backgroundColor}
        fresh
        mouseEnterDelay={values?.waitDuration}
        mouseLeaveDelay={values?.showDuration}
        onOpenChange={handleTooltipTriggered}
        placement={values?.preferBelow ? "bottom" : "top"}
        ref={rootRef}
        title={values?.message}
      >
        {EnsembleRuntime.render([unwrappedWidget])}
      </Tooltip>
    </ConfigProvider>
  );
};

WidgetRegistry.register(widgetName, ToolTip);
