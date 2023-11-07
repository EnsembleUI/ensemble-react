import { Table } from "antd";
import {
  useTemplateData,
  type Expression,
  type EnsembleWidget,
  useWidgetId,
} from "@ensembleui/react-framework";
import { map } from "lodash-es";
import { useMemo, type ReactElement } from "react";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetProps } from "../../util/utils";
import { DataCell } from "./DataCell";

interface DataColumn {
  label: string;
  type: string;
  tooltip?: string;
  sortable?: boolean;
  sortKey?: string;
}

export interface GridProps extends EnsembleWidgetProps<object> {
  DataColumns: DataColumn[];
  "item-template": {
    data: Expression<object>;
    name: string;
    template: DataGridRowTemplate;
  };
}

export interface DataGridRowTemplate {
  name: "DataRow";
  properties: {
    children: EnsembleWidget[];
  };
}

export const DataGrid: React.FC<GridProps> = ({
  DataColumns,
  "item-template": itemTemplate,
  id,
}) => {
  const widgetId = useWidgetId(id);
  const templateData = useTemplateData(itemTemplate.data);
  const namedData = useMemo(
    () =>
      map(templateData, (value) => {
        const namedObj: Record<string, unknown> = {};
        namedObj[itemTemplate.name] = value;
        return namedObj;
      }),
    [itemTemplate.name, templateData],
  );
  return (
    <Table dataSource={namedData} key={widgetId} style={{ width: "100%" }}>
      {DataColumns.map((col, index) => {
        return (
          <Table.Column
            dataIndex={itemTemplate.name}
            key={col.label}
            render={(_: unknown, record: unknown): ReactElement => {
              return (
                <DataCell
                  columnIndex={index}
                  data={record}
                  scopeName={itemTemplate.name}
                  template={itemTemplate.template}
                />
              );
            }}
            title={col.label}
          />
        );
      })}
    </Table>
  );
};

WidgetRegistry.register("DataGrid", DataGrid);
