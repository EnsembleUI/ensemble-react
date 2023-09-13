import { Table } from "antd";
import { type Expression, type Widget, useEnsembleStore } from "framework";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";

interface DataColumn {
  label: string;
  type: string;
  tooltip?: string;
  sortable?: boolean;
  sortKey?: string;
}

export interface GridProps {
  DataColumns: DataColumn[];
  "item-template": {
    data: Expression<object>;
    name: string;
    template: {
      DataRow: {
        children: Widget[];
      };
    };
  };
}

export const DataGrid: React.FC<GridProps> = ({
  DataColumns,
  "item-template": itemTemplate,
}) => {
  const { templateData } = useEnsembleStore((state) => ({
    templateData: get(state.screen, itemTemplate.data as string) as object,
  }));
  return (
    <Table
      columns={DataColumns.map((col) => ({ title: col.label }))}
      dataSource={templateData as []}
    />
  );
};

WidgetRegistry.register("DataGrid", DataGrid);
