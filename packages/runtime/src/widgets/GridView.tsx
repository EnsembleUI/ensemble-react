import { map } from "lodash-es";
import type { CustomScope, Expression, EnsembleWidget } from "framework";
import { CustomScopeProvider, useTemplateData } from "framework";
import { Col, Row } from "antd";
import { isString } from "antd/es/button";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { GridViewStyles } from "../util/types";

interface EnsembleWidgetProps<T> {
  id?: string;
  [key: string]: unknown;
  styles?: T;
}

export type GridViewProps = {
  "item-template": {
    data: Expression<object>;
    name: string;
    template: EnsembleWidget;
  };
} & EnsembleWidgetProps<GridViewStyles>;

export const GridView: React.FC<GridViewProps> = ({
  "item-template": { data, name, template },
  styles,
}) => {
  const defaultColumnCount = 4;
  const templateData = useTemplateData(
    isString(data) ? removeCurlyBraces(data) : data,
  );

  const namedData = map(templateData, (value) => ({
    [name]: value,
  }));

  const rows = [];
  const colCount = styles?.horizontalTileCount ?? defaultColumnCount;
  const rowCount = Math.ceil(namedData.length / colCount);

  for (let i = 0; i < rowCount; i++) {
    const cols = [];
    for (let j = 0; j < colCount; j++) {
      const dataIndex = i * colCount + j;
      if (dataIndex < namedData.length)
        cols.push(
          <Col
            key={dataIndex}
            style={{
              display: "flex",
              flexGrow: 1,
              justifyContent: "center",
              marginLeft: (styles?.horizontalGap ?? 20) / 2,
              marginRight: (styles?.horizontalGap ?? 20) / 2,
              maxWidth: `calc(100% / ${styles?.horizontalTileCount ?? 4} - ${
                styles?.horizontalGap ?? 20
              }px)`,
            }}
          >
            <CustomScopeProvider value={namedData[dataIndex] as CustomScope}>
              {EnsembleRuntime.render([template])}
            </CustomScopeProvider>
          </Col>,
        );
    }
    rows.push(
      <Row
        gutter={[styles?.horizontalGap ?? 10, styles?.verticalGap ?? 10]}
        key={i}
        style={{
          alignItems: "center",
          marginTop: (styles?.verticalGap ?? 20) / 2,
          marginBottom: (styles?.verticalGap ?? 20) / 2,
        }}
      >
        {cols}
      </Row>,
    );
  }

  return <>{rows}</>;
};

WidgetRegistry.register("GridView", GridView);

function removeCurlyBraces(string: string): string {
  if (string.startsWith("${") && string.endsWith("}")) {
    return string.substring(2, string.length - 1);
  }
  return string;
}
