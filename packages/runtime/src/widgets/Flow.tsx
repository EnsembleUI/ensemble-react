import React, { useMemo } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, FlexboxProps } from "../util/types";
import { EnsembleRuntime } from "../runtime";
import { Space } from "antd";
import {
  CustomScope,
  CustomScopeProvider,
  Expression,
  Widget,
  useEnsembleStore,
} from "framework";
import { get, map } from "lodash-es";

interface FlowProps {
  "item-template": {
    data: Expression<object>;
    name: string;
    template: FlowComponentTemplate;
  };
}

interface FlowComponentTemplate extends Widget {
  name: "FlowComponents";
  properties: {
    children: Widget[];
  };
}

export const Flow: React.FC<FlowProps> = ({
  "item-template": itemTemplate,
}) => {
  const { templateData } = useEnsembleStore((state) => ({
    templateData: get(state.screen, itemTemplate.data as string) as object,
  }));

  const namedData = map(templateData, (value) => {
    const namedObj: Record<string, unknown> = {};
    namedObj[itemTemplate.name] = value;
    return namedObj;
  });

  return (
    <Space wrap>
      {itemTemplate.template.properties.children.map((item, i) => {
        return (
          <CustomScopeProvider value={namedData[i] as CustomScope}>
            {EnsembleRuntime.render([item])}
          </CustomScopeProvider>
        );
      })}
    </Space>
  );
};

WidgetRegistry.register("Flow", Flow);
