import React from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Space } from "antd";
import { CustomScope, CustomScopeProvider, Expression, Widget, useEnsembleStore } from "framework";
import { get, map } from "lodash-es";

interface FlowProps {
  "item-template": {
    data: Expression<object> | string[];
    name: string;
    template: Widget;
  };
}

export const Flow: React.FC<FlowProps> = ({
  "item-template": itemTemplate,
}) => {
  let namedData: Record<string, unknown>[] | number[] | string[] = [];

  const { templateData } = useEnsembleStore((state) => ({
    templateData: get(state.screen, itemTemplate.data as string) as object,
  }));

  if (Array.isArray(itemTemplate.data)) {
    namedData = map(itemTemplate.data, (value) => {
      const namedObj: Record<string, unknown> = {};
      namedObj[itemTemplate.name] = value;
      return namedObj;
    });
  } else {
    namedData = map(templateData, (value) => {
      const namedObj: Record<string, unknown> = {};
      namedObj[itemTemplate.name] = value;
      return namedObj;
    });
  }

  return (<Space wrap>
    {namedData.map(n => (
      <CustomScopeProvider value={n as CustomScope}>
        {EnsembleRuntime.render([itemTemplate.template])}
      </CustomScopeProvider>
    ))}
  </Space>)
};

WidgetRegistry.register("Flow", Flow);
