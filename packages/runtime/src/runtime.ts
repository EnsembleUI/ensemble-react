import type { EnsembleScreen } from "framework";
import { WidgetRegistry } from "./registry";

export const EnsembleRuntime = {
  execute: (application: EnsembleScreen): React.ReactNode => {
    const rootWidget = application.root;
    const WidgetFn = WidgetRegistry.find(rootWidget.name);
    if (!WidgetFn) {
      throw new Error(`Unknown widget: ${rootWidget.name}`);
    }
    return WidgetFn(rootWidget.properties);
  },
};
