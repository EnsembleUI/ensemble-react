import type { EnsembleWidget } from "framework";
import type { ReactNode } from "react";
import { isValidElement } from "react";
import { WidgetRegistry } from "../registry";

export const EnsembleRuntime = {
  render: (widgets: EnsembleWidget[]): ReactNode[] => {
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
