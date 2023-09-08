import type { EnsembleScreen, Widget } from "framework";
import { WidgetRegistry } from "../registry";

export const EnsembleRuntime = {
  execute: (application: EnsembleScreen): React.ReactNode => {
    const rootWidget: Widget = application.body;
    const WidgetFn = WidgetRegistry.find(rootWidget.name);
    if (!(WidgetFn instanceof Function)) {
      throw new Error(`Unknown widget: ${rootWidget.name}`);
    }
    return <WidgetFn {...rootWidget.properties} />;
  },
};
