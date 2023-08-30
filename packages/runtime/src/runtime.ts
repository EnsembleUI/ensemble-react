import type { EnsembleScreen, Widget } from "framework";
import { WidgetRegistry } from "./registry";

export const EnsembleRuntime = {
  execute: (application: EnsembleScreen): React.ReactNode => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rootWidget: Widget = application.body;
    const WidgetFn = WidgetRegistry.find(rootWidget.name);
    if (!WidgetFn) {
      // eslint-disable-next-line no-console
      console.log("blah");
      throw new Error(`Unknown widget: ${rootWidget.name}`);
    }
    return WidgetFn(rootWidget.properties);
  },
};
