import { Table } from "antd";
import {
  useTemplateData,
  type Expression,
  type EnsembleWidget,
  useWidgetId,
  evaluate,
  defaultScreenContext,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { type ReactElement } from "react";
import { get } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../shared/types";
import { DataCell } from "./DataCell";

interface DataColumn {
  label: string;
  type: string;
  tooltip?: string;
  sort?: {
    compareFn: string;
  };
  filter?: {
    values: {
      label: string;
      value: string | number | boolean;
    }[];
    onFilter: string;
  };
}

export interface DataGridStyles extends Partial<EnsembleWidgetStyles> {
  headerStyle?: {
    backgroundColor: Expression<string>;
    fontSize: Expression<string>;
    fontFamily: Expression<string>;
    fontWeight: Expression<string>;
    textColor: Expression<string>;
    hasDivider: boolean;
    borderBottom: string;
  };
}

export type GridProps = {
  DataColumns: DataColumn[];
  "item-template": {
    data: Expression<object>;
    name: string;
    template: DataGridRowTemplate;
  };
} & EnsembleWidgetProps<DataGridStyles>;

export interface DataGridRowTemplate {
  name: "DataRow";
  properties: {
    children: EnsembleWidget[];
  };
}

export const DataGrid: React.FC<GridProps> = (props) => {
  const DataColumns = props?.DataColumns;
  const itemTemplate = props["item-template"];
  const { resolvedWidgetId, rootRef } = useWidgetId(props?.id);
  const { namedData } = useTemplateData({ ...itemTemplate });
  const { values } = useRegisterBindings({ ...props }, props?.id);
  const headerStyle = values?.styles?.headerStyle;
  return (
    <>
      <Table
        dataSource={namedData}
        key={resolvedWidgetId}
        ref={rootRef}
        style={{ width: "100%" }}
      >
        {DataColumns.map((col, index) => {
          return (
            <Table.Column
              dataIndex={itemTemplate.name}
              filters={col.filter?.values.map(({ label, value }) => ({
                text: label,
                value,
              }))}
              key={col.label}
              onFilter={
                col.filter?.onFilter
                  ? (value, record): boolean =>
                      Boolean(
                        evaluate(defaultScreenContext, col.filter?.onFilter, {
                          value,
                          record,
                          [itemTemplate.name]: get(
                            record,
                            itemTemplate.name,
                          ) as unknown,
                        }),
                      )
                  : undefined
              }
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
              sorter={
                col.sort?.compareFn
                  ? (a, b): number =>
                      Number(
                        evaluate(defaultScreenContext, col.sort?.compareFn, {
                          a,
                          b,
                        }),
                      )
                  : undefined
              }
              title={col.label}
            />
          );
        })}
      </Table>
      <style>
        {`
			.ant-table-thead > tr > th {
				${
          headerStyle?.backgroundColor
            ? `background-color : ${headerStyle.backgroundColor} !important;`
            : ""
        }
		${
      headerStyle?.fontFamily
        ? `font-family : ${headerStyle.fontFamily} !important;`
        : ""
    }
		${
      headerStyle?.fontSize
        ? `font-size : ${headerStyle.fontSize} !important;`
        : ""
    }
		${
      headerStyle?.fontWeight
        ? `font-weight : ${headerStyle.fontWeight} !important;`
        : ""
    }
		${headerStyle?.textColor ? `color : ${headerStyle.textColor} !important;` : ""}
			}
			.ant-table-thead > tr > th::before{
				${headerStyle?.hasDivider ? `position : unset !important;` : ""}
			}
			.ant-table-thead > tr > th {
				${!headerStyle?.borderBottom ? "border-bottom: none !important" : ""}
			}
		`}
      </style>
    </>
  );
};

WidgetRegistry.register("DataGrid", DataGrid);
