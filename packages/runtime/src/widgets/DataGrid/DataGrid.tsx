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
import {
  useCallback,
  type ReactElement,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { get, isArray, isString } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
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
    children?: EnsembleWidget[];
  } & HasItemTemplate;
}

export interface DataGridScrollable {
  scrollHeight?: string;
  scrollWidth?: string;
}

export type GridProps = {
  allowSelection?: boolean;
  onRowsSelected?: EnsembleAction;
  DataColumns: Expression<DataColumn[] | string[]>;
  "item-template": {
    data: Expression<object>;
    name: string;
    key?: Expression<string>;
    template: DataGridRowTemplate;
  };
  hidePagination?: boolean;
  scroll?: DataGridScrollable;
  onScrollEnd?: EnsembleAction;
} & EnsembleWidgetProps<DataGridStyles>;

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
    props.allowSelection ?? false,
  );
  const { "item-template": itemTemplate, onScrollEnd, ...rest } = props;
  const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
    "checkbox",
  );
  const {
    rootRef,
    id: resolvedWidgetId,
    values,
  } = useRegisterBindings(
    { ...rest, rowsSelected, selectionType, allowSelection },
    props.id,
    {
      setRowsSelected,
      setSelectionType,
      setAllowSelection,
    },
  );
  const { namedData } = useTemplateData({ ...itemTemplate });
  const headerStyle = values?.styles?.headerStyle;
  const onTapAction = useEnsembleAction(itemTemplate.template.properties.onTap);
  const onRowsSelected = useEnsembleAction(props.onRowsSelected);
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

  const containerRef = useRef<HTMLDivElement>(null);
  const onScrollEndAction = useEnsembleAction(onScrollEnd);
  // scroll end action
  const onScrollEndActionCallback = useCallback(() => {
    if (onScrollEndAction) {
      onScrollEndAction.callback();
    }
  }, [onScrollEndAction]);

  // handle scroll event
  const handleScrollEvent = useCallback(
    (event: Event): void => {
      const container = event.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if the user has scrolled to the bottom
      if (scrollTop + clientHeight === scrollHeight) {
        onScrollEndActionCallback();
      }
    },
    [onScrollEndActionCallback],
  );

  useEffect(() => {
    const containerElement = containerRef.current;
    const targetElem = containerElement?.querySelector(".ant-table-body");
    if (onScrollEnd) {
      // assign scroll event listener to element
      if (targetElem) {
        targetElem.addEventListener("scroll", handleScrollEvent);
      }
    }

    return () => {
      if (onScrollEnd) {
        // remove scroll event listener from element
        if (targetElem) {
          targetElem.removeEventListener("scroll", handleScrollEvent);
        }
      }
    };
  }, [rootRef, onScrollEnd, handleScrollEvent]);

  // handle datagrid column list
  const dataColumns = useMemo(() => {
    if (values?.DataColumns && isArray(values.DataColumns)) {
      return values.DataColumns.map((item): unknown => {
        if (isString(item)) {
          return { label: item };
        }
        return item;
      }) as DataColumn[];
    }

    return [];
  }, [values?.DataColumns]);

  // // handle onrow click
  // const handleOnRowClick = (
  //   event: React.MouseEvent<unknown>,
  //   record: unknown,
  //   recordIndex?: number,
  // ): void => {
  //   const targetElem = event.target as HTMLElement;
  //   if (targetElem.tagName !== "TD") {
  //     return;
  //   }
  //   onTapActionCallback(record, recordIndex);
  // };

  return (
    <div ref={containerRef}>
      <Table
        dataSource={namedData}
        key={resolvedWidgetId}
        onRow={(record, recordIndex) => {
          return { onClick: (e) => onTapActionCallback(record, recordIndex) };
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
          values?.scroll
            ? {
                y: values.scroll.scrollHeight || 150,
                x: values.scroll.scrollWidth || "max-content",
              }
            : undefined
        }
        style={{
          width: "100%",
          ...values?.styles,
          ...(values?.styles?.visible === false
            ? { display: "none" }
            : undefined),
        }}
      >
        {dataColumns.map((col, colIndex) => {
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
              render={(_, record, rowIndex): ReactElement => {
                return (
                  <DataCell
                    columnIndex={colIndex}
                    data={record}
                    rowIndex={rowIndex}
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
    </div>
  );
};

WidgetRegistry.register("DataGrid", DataGrid);
