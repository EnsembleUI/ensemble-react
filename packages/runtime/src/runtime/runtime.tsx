import type { EnsembleScreen, Widget } from "framework";
import type { ReactNode } from "react";
import { isValidElement } from "react";
import { WidgetRegistry } from "../registry";

export const EnsembleRuntime = {
  execute: (application: EnsembleScreen): ReactNode => {
    const rootWidget: Widget = application.body;
    const WidgetFn = WidgetRegistry.find(rootWidget.name);
    if (!(WidgetFn instanceof Function)) {
      throw new Error(`Unknown widget: ${rootWidget.name}`);
    }
    return <WidgetFn {...rootWidget.properties} />;
  },
  render: (widgets: Widget[]): ReactNode[] => {
    return widgets.map((child, index) => {
      const result = WidgetRegistry.find(child.name);
      if (isValidElement(result)) {
        return result;
      }
      const WidgetFn = result as React.FC<unknown>;
      return <WidgetFn {...child.properties} key={index} />;
    });
  },
};
