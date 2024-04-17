import { Table, type TableProps } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import {
  Resizable,
  type ResizableProps,
  type ResizableState,
} from "react-resizable";
import {
  useTemplateData,
  type Expression,
  type EnsembleWidget,
  evaluate,
  defaultScreenContext,
  useRegisterBindings,
  type EnsembleAction,
  unwrapWidget,
} from "@ensembleui/react-framework";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import type { ReactEventHandler, ReactElement } from "react";
import { get, isArray, isString, isObject, cloneDeep } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
} from "../../shared/types";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../../runtime";
import { DataCell } from "./DataCell";

interface DataColumn {
  label?: Expression<{ [key: string]: unknown }>;
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
  width?: number;
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
  allowResizableColumns?: boolean;
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
  onPageChange?: EnsembleAction;
  onSort?: EnsembleAction;
  pageSize?: number;
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

const ResizableTitle: React.FC<ResizableProps & ResizableState> = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      draggableOpts={{ enableUserSelectHack: false }}
      handle={
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      height={0}
      onResize={onResize}
      width={width}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export const DataGrid: React.FC<GridProps> = (props) => {
  const [colWidth, setColWidth] = useState<{
    [key: number]: number | undefined;
  }>({});
  const [rowsSelected, setRowsSelected] = useState<object[]>();
  const [allowSelection, setAllowSelection] = useState(
    props.allowSelection ?? false,
  );
  const {
    "item-template": itemTemplate,
    onScrollEnd,
    onPageChange,
    onSort,
    ...rest
  } = props;
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
      return values.DataColumns.map((item, index): unknown => {
        if (isString(item)) {
          return {
            label: item,
            ...(values.allowResizableColumns
              ? { width: colWidth[index] ?? 100 }
              : {}),
          };
        }
        let label = null;
        if (isString(item.label)) {
          label = item.label;
        } else if (isObject(item.label)) {
          label = EnsembleRuntime.render([unwrapWidget(cloneDeep(item.label))]);
        }
        return {
          ...item,
          label,
          ...(values.allowResizableColumns
            ? { width: colWidth[index] ?? item.width ?? 100 }
            : {}),
        };
      }) as DataColumn[];
    }

    return [];
  }, [values?.DataColumns, values?.allowResizableColumns, colWidth]);

  const components = {
    header: {
      cell: ResizableTitle,
    },
  };

  const handleResize =
    (index: number) =>
    (e: React.SyntheticEvent, { size }: { size: { width: number } }) => {
      const prevColWidths = { ...colWidth };
      prevColWidths[index] = size.width;
      setColWidth(prevColWidths);
    };

  const onPageChangeAction = useEnsembleAction(onPageChange);
  // page change action
  const onPageChangeActionCallback = useCallback(
    (page: number) => {
      if (onPageChangeAction) {
        onPageChangeAction.callback({ page, pageSize: values?.pageSize });
      }
    },
    [onPageChangeAction],
  );

  // handle page change
  const handlePageChange = (page: number): void => {
    onPageChangeActionCallback(page);
  };

  const paginationObject = useMemo(() => {
    const { hidePagination, pageSize } = values ?? {};

    if (hidePagination || pageSize === undefined || pageSize < 1) {
      return false;
    }

    return { onChange: handlePageChange, pageSize: values?.pageSize };
  }, [values?.hidePagination, values?.pageSize]);

  const onSortAction = useEnsembleAction(onSort);
  // page change action
  const onSortActionCallback = useCallback(
    (sorter: SorterResult<unknown>) => {
      if (onSortAction) {
        console.log({ sorter });
        onSortAction.callback({
          sortOrder: sorter.order,
          columnTitle: sorter.column?.title,
        });
      }
    },
    [onSortAction],
  );

  const onChange: TableProps["onChange"] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    switch (extra.action) {
      case "sort":
        onSortActionCallback(sorter as SorterResult<unknown>);
        break;

      default:
        break;
    }
  };

  return (
    <div id={resolvedWidgetId} ref={containerRef}>
      <Table
        components={components}
        dataSource={namedData}
        key={resolvedWidgetId}
        onChange={onChange}
        onRow={(record, recordIndex) => {
          return { onClick: () => onTapActionCallback(record, recordIndex) };
        }}
        pagination={paginationObject}
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
              key={colIndex}
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
              onHeaderCell={
                values?.allowResizableColumns
                  ? () => ({
                      width: col.width,
                      onResize: handleResize(
                        colIndex,
                      ) as ReactEventHandler<any>,
                    })
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
              title={col.label as string | React.ReactNode}
              width={col.width}
            />
          );
        })}
      </Table>
      <style>
        {`
          .react-resizable {
            position: relative;
            background-clip: padding-box;
          }

          .react-resizable-handle {
            position: absolute;
            right: -5px;
            bottom: 0;
            z-index: 1;
            width: 10px;
            height: 100%;
            cursor: col-resize;
          }

          #${resolvedWidgetId} .ant-table-thead > tr > th {
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
            ${
              headerStyle?.textColor
                ? `color : ${headerStyle.textColor} !important;`
                : ""
            }
			    }

          #${resolvedWidgetId} .ant-table-thead > tr > th::before{
            ${!headerStyle?.hasDivider ? `position : unset !important;` : ""}
          }

          #${resolvedWidgetId} .ant-table-thead > tr > th {
            ${
              !headerStyle?.borderBottom ? "border-bottom: none !important" : ""
            }
          }
		    `}
      </style>
    </div>
  );
};

WidgetRegistry.register("DataGrid", DataGrid);
