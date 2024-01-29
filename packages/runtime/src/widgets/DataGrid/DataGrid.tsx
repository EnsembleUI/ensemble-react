import { Table } from "antd";
import {
  useTemplateData,
  type Expression,
  type EnsembleWidget,
  evaluate,
  defaultScreenContext,
  useRegisterBindings,
  type EnsembleAction,
} from "@ensembleui/react-framework";
import { useCallback, type ReactElement, useState } from "react";
import { get } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../shared/types";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
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
  styles?: EnsembleWidgetStyles;
}

export interface DataGridRowTemplate {
  name: "DataRow";
  properties: {
    onTap?: EnsembleAction;
    children: EnsembleWidget[];
  };
}

export type GridProps = {
  allowSelection?: boolean;
  onRowsSelected?: EnsembleAction;
  DataColumns: DataColumn[];
  scrollable?: boolean;
  scrollHeight?: number;
  "item-template": {
    data: Expression<object>;
    name: string;
    key?: Expression<string>;
    template: DataGridRowTemplate;
  };
  hidePagination?: boolean;
} & EnsembleWidgetProps<DataGridStyles>;

export interface DataGridRowTemplate {
  name: "DataRow";
  properties: {
    onTap?: EnsembleAction;
    children: EnsembleWidget[];
  };
}

function djb2Hash(str: string): number {
  let hash = 5381;

  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  // eslint-disable-next-line no-bitwise
  return hash >>> 0; // Ensure the result is an unsigned 32-bit integer
}

export const DataGrid: React.FC<GridProps> = (props) => {
  const [rowsSelected, setRowsSelected] = useState<object[]>();
  const [allowSelection, setAllowSelection] = useState(
    props?.allowSelection ?? false,
  );
  const { "item-template": itemTemplate, DataColumns, ...rest } = props;
  const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
    "checkbox",
  );
  const {
    rootRef,
    id: resolvedWidgetId,
    values,
  } = useRegisterBindings(
    { ...rest, rowsSelected, selectionType, allowSelection },
    props?.id,
    {
      setRowsSelected,
      setSelectionType,
      setAllowSelection,
    },
  );
  const { namedData } = useTemplateData({ ...itemTemplate });
  const headerStyle = values?.styles?.headerStyle;
  const onTapAction = useEnsembleAction(itemTemplate.template.properties.onTap);
  const onRowsSelected = useEnsembleAction(props?.onRowsSelected);
  const onRowsSelectedCallback = useCallback(
    (selectedRowKeys: React.Key[], selectedRows: object[]) => {
      if (!onRowsSelected) {
        return;
      }
      return onRowsSelected.callback({ selectedRows, selectedRowKeys });
    },
    [onRowsSelected],
  );
  const onTapActionCallback = useCallback(
    (data: unknown, index?: number) => {
      if (!onTapAction) {
        return;
      }

      return onTapAction.callback({ data, index });
    },
    [onTapAction],
  );

  return (
    <>
      <Table
        dataSource={namedData}
        key={resolvedWidgetId}
        onRow={(record, recordIndex) => {
          return { onClick: () => onTapActionCallback(record, recordIndex) };
        }}
        pagination={values?.hidePagination ? false : undefined}
        ref={rootRef}
        rowKey={(data: unknown) => {
          const identifier: string = evaluate(
            defaultScreenContext,
            itemTemplate.key,
            {
              [itemTemplate.name]: get(data, itemTemplate.name) as unknown,
            },
          );
          if (identifier) {
            return identifier;
          }
          const res = djb2Hash(JSON.stringify(data));
          return String(res);
        }}
        rowSelection={
          allowSelection
            ? {
                type: selectionType,
                onChange: (selectedRowKeys, selectedRows) => {
                  setRowsSelected(selectedRows);
                  return onRowsSelectedCallback(selectedRowKeys, selectedRows);
                },
              }
            : undefined
        }
        scroll={
          values?.scrollable ? { y: values.scrollHeight || 150 } : undefined
        }
        style={{
          width: "100%",
          ...values?.styles,
          ...(values?.styles?.visible === false
            ? { display: "none" }
            : undefined),
        }}
      >
        {DataColumns?.map((col, index) => {
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
