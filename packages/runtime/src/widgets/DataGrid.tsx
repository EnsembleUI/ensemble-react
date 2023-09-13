import React from "react";
import { Button as AntButton, Table as AntTable } from "antd";
import { useEnsembleState, useEvaluate } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";

export type DataColumn = {
  label: string;
  type: string;
  tooltip?: string;
  sortable?: boolean;
  sortKey?: string;
};

// export type Widget = {
//     Text: string;
//     Markdown: string;
//     Html: string;
//     Icon: string;
//     Image: string;
//     ImageCropper: string;
//     Lottie: string;
//     QRCode: string;
//     Progress: string;
//     Divider: string;
//     Spacer: string;
//     Toggle: string;
//     ToggleContainer: string;
//     LoadingContainer: string;
//     PopupMenu: string;
// }
export interface Widget {
  name: string;
  properties: Record<string, unknown>;
}
export type Widgets = {
    items: Widget[];
}

export type DataRow = {
    chidlren: Widgets;
}

export type DataRows = {
    DataRow: DataRow;
}

export type DataRowTemplate = {
  data: string;
  name: string;
  template: DataRows;
};

type LineHeight = "default" | "1.0" | "1.15" | "1.25" | "1.5" | "2.0" | "2.5";

export type headingText = {
    font: string;
    fontSize: number;
    fontWeight: string | number;
    color: string;
    lineHeight: string | number | LineHeight;
}


export type dataText = {
  font: string;
  fontSize: number;
  fontWeight: string | number;
  color: string;
  lineHeight: string | number | LineHeight;
};

export type styles ={
    headingText: headingText;
    dataText: dataText;
}

export type DataGridProps = {
  DataColumns: DataColumn[];
  DataRowTemplate?: DataRowTemplate;
  children?: DataRows[];
  styles?: styles;
  horizontalMargin?: number;
  dataRowHeight?: number;
  headingRowHeight?: number;
  columnSpacing?: number;
  dividerThickness?: number;
  sorting?: {
    columnIndex: number;
    order: "ascending" | "descending";
  };
  // Other properties from your JSON schema
} & EnsembleWidgetProps;

export const DataGrid: React.FC<DataGridProps> = (props) => {
  //const onTap = props.onItemTap?.executeCode;
  const { values } = useEnsembleState(props, props.id);
  //const onTapCallback = useEvaluate(onTap, values);

  const columns = props.DataColumns.map((column) => ({
    title: column.label,
    dataIndex: column.sortKey || "",
    sorter: column.sortable || false,
    type: column.type || "",
  }));

  return (
    <div>
      
      <AntTable columns={columns} />
    </div>
  );
};

WidgetRegistry.register("DataGrid", DataGrid);
