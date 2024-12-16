import type { EnsembleWidget } from "@ensembleui/react-framework";
import type { ReactNode } from "react";
import { isValidElement } from "react";
import { isEmpty } from "lodash-es";
import { WidgetRegistry } from "../registry";

export const EnsembleRuntime = {
  render: (widgets: EnsembleWidget[]): ReactNode[] => {
    if (isEmpty(widgets)) {
      return [];
    }
    return widgets.map((child, index) => {
      const result = WidgetRegistry.find(child.name);
      if (isValidElement(result)) {
        return result;
      }
      const WidgetFn = result as React.FC<unknown>;
      return <WidgetFn {...child.properties} key={child.key ?? index} />;
    });
  },
};
