import type { EnsembleWidget } from "@ensembleui/react-framework";
import type { ReactNode } from "react";
import { isValidElement } from "react";
import { isEmpty, isString } from "lodash-es";
import { WidgetRegistry } from "../registry";

export const EnsembleRuntime = {
  render: (widgets: (string | EnsembleWidget)[]): ReactNode[] => {
    if (isEmpty(widgets)) {
      return [];
    }
    return widgets.map((child, index) => {
      if (isString(child)) {
        const result = WidgetRegistry.find("Text");
        const WidgetFn = result as React.FC<{ text: string }>;
        return <WidgetFn key={index} text={child} />;
      }

      const result = WidgetRegistry.find(child.name);
      if (isValidElement(result)) {
        return result;
      }

      const WidgetFn = result as React.FC<unknown>;
      return <WidgetFn {...child.properties} key={child.key ?? index} />;
    });
  },
};
