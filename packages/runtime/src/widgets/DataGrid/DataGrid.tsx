import { Table, type TableProps, ConfigProvider } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import isEqual from "react-fast-compare";
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
  useEvaluate,
} from "@ensembleui/react-framework";
import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
  memo,
} from "react";
import type { ReactEventHandler, ReactElement } from "react";
import {
  get,
  isArray,
  isString,
  isObject,
  cloneDeep,
  compact,
} from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
} from "../../shared/types";
import { getComponentStyles } from "../../shared/styles";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../../runtime";
import { DataCell } from "./DataCell";

const widgetName = "DataGrid";

interface DataColumn {
  label?: Expression<{ [key: string]: unknown }>;
  type?: string;
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
  visible?: boolean;
}

export interface DataGridStyles
  extends Partial<
    EnsembleWidgetStyles & {
      rowHoverBg?: Expression<string>;
      rowSelectedHoverBg?: Expression<string>;
    }
  > {
  headerStyle?: {
    backgroundColor?: Expression<string>;
    fontSize?: Expression<string>;
    fontFamily?: Expression<string>;
    fontWeight?: Expression<string>;
    textColor?: Expression<string>;
    hasDivider?: boolean;
    borderBottom?: string;
  };
  styles?: EnsembleWidgetStyles;
}

export interface DataGridRowTemplate {
  name: "DataRow";
  properties: {
    disableSelection?: Expression<boolean>;
    onTap?: EnsembleAction;
    children?: EnsembleWidget[];
    styles?: EnsembleWidgetStyles;
  } & HasItemTemplate;
}

export interface DataGridScrollable {
  scrollHeight?: string | number;
  scrollWidth?: string;
}

export type GridProps = {
  allowSelection?: boolean;
  selectionType?: "checkbox" | "radio";
  selectionColWidth?: number;
  allowResizableColumns?: boolean;
  onRowsSelected?: EnsembleAction;
  defaultSelectedRowKeys?: string[];
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
  totalRows?: number;
  curPage?: number;
  virtual?: boolean;
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

const CustomRowWithStyles: React.FC<
  React.PropsWithChildren<{
    "data-index"?: number;
    "data-styles"?: EnsembleWidgetStyles;
    "data-record"?: object;
    [key: string]: unknown;
  }>
> = memo(
  ({
    "data-index": index,
    "data-styles": rowStyles,
    "data-record": record,
    children,
    ...props
  }) => {
    const memoizedContext = useMemo(
      () => ({ ...record, index }),
      [record, index],
    );

    const evaluatedRowStyles = useEvaluate(
      rowStyles ? (rowStyles as { [key: string]: unknown }) : undefined,
      {
        context: memoizedContext,
      },
    );

    return (
      <tr {...props} style={{ ...evaluatedRowStyles }}>
        {children}
      </tr>
    );
  },
);
CustomRowWithStyles.displayName = "CustomRowWithStyles";

const defaultGridMutatorOptions = {
  suppressCallbacks: false,
};

export const DataGrid: React.FC<GridProps> = (props) => {
  const {
    "item-template": itemTemplate,
    onScrollEnd,
    onPageChange,
    onSort,
    ...rest
  } = props;

  const [colWidth, setColWidth] = useState<{
    [key: number]: number | undefined;
  }>({});
  const [curPage, setCurPage] = useState<number>(props.curPage || 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize || 10);
  const [rowsSelected, setRowsSelected] = useState<object[]>();
  const [rowsKey, setRowsKey] = useState<React.Key[]>([]);
  const [allowSelection, setAllowSelection] = useState(
    props.allowSelection ?? false,
  );
  const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
    props.selectionType ? props.selectionType : "checkbox",
  );
  const selectionColWidth = props.selectionColWidth || 50;
  const containerRef = useRef<HTMLDivElement>(null);
  const { namedData } = useTemplateData({ ...itemTemplate });

  // on row tap action
  const onTapAction = useEnsembleAction(itemTemplate.template.properties.onTap);
  const onTapActionCallback = useCallback(
    (data: unknown, index?: number) => {
      return onTapAction?.callback({ data, index });
    },
    [onTapAction?.callback],
  );

  const components = {
    header: {
      cell: ResizableTitle,
    },
    body: {
      row: CustomRowWithStyles,
    },
  };

  // on row selected action
  const onRowsSelected = useEnsembleAction(props.onRowsSelected);
  const onRowsSelectedCallback = useCallback(
    (selectedRowKeys: React.Key[], selectedRows: object[]) => {
      return onRowsSelected?.callback({ selectedRows, selectedRowKeys });
    },
    [onRowsSelected?.callback],
  );

  // scroll end action
  const onScrollEndAction = useEnsembleAction(onScrollEnd);
  const onScrollEndActionCallback = useCallback(() => {
    if (onScrollEndAction) {
      onScrollEndAction.callback();
    }
  }, [onScrollEndAction?.callback]);

  // page change action
  const onPageChangeAction = useEnsembleAction(onPageChange);
  const onPageChangeActionCallback = useCallback(
    (page: number, newPageSize: number) => {
      if (onPageChangeAction) {
        onPageChangeAction.callback({
          page,
          pageSize: newPageSize,
          totalRows: values?.totalRows,
        });
      }
    },
    [onPageChangeAction?.callback],
  );

  // column sort action
  const onSortAction = useEnsembleAction(onSort);
  const onSortActionCallback = useCallback(
    (sorter: SorterResult<unknown>) => {
      if (onSortAction) {
        const namedDataObject = namedData[0] as { [key: string]: unknown };
        const dataObject = namedDataObject[sorter.field as string] as {
          [key: string]: unknown;
        };
        const dataObjectKeys = Object.keys(dataObject);

        onSortAction.callback({
          sortOrder: sorter.order,
          columnTitle: sorter.column?.title,
          dataKey: dataObjectKeys[sorter.columnKey as number],
        });
      }
    },
    [onSortAction?.callback, namedData],
  );

  // handle scroll event
  const handleScrollEvent = useCallback(
    (event: Event): void => {
      const container = event.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if the user has scrolled to the bottom
      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        onScrollEndActionCallback();
      }
    },
    [onScrollEndActionCallback],
  );

  // update page number callback
  const updatePageNumber = useCallback(
    (newPage: number, options = defaultGridMutatorOptions) => {
      setCurPage(newPage);
      if (!options.suppressCallbacks) {
        onPageChangeActionCallback(newPage, pageSize || 10);
      }
    },
    [pageSize, onPageChangeActionCallback],
  );

  // update pageSize callback
  const updatePageSize = useCallback(
    (newPageSize: number, options = defaultGridMutatorOptions) => {
      setPageSize(newPageSize);
      if (!options.suppressCallbacks) {
        onPageChangeActionCallback(curPage, newPageSize || 10);
      }
    },
    [curPage, onPageChangeActionCallback],
  );

  const handleRowsSelection = useCallback(
    (selectedKeys: React.Key[]) => {
      setRowsKey(selectedKeys);

      const keyField =
        // eslint-disable-next-line prefer-named-capture-group
        itemTemplate.key?.replace(/^\$\{(.*)\}$/, "$1") || ""; // replace "${...}" or '${...}' with ...

      const selectedRows = compact(
        namedData.map((row) => {
          const key = get(row, keyField) as React.Key;
          return selectedKeys.includes(key) ? row : null;
        }),
      );

      setRowsSelected(selectedRows);
    },
    [namedData, itemTemplate],
  );

  const {
    rootRef,
    id: resolvedWidgetId,
    values,
  } = useRegisterBindings(
    {
      ...rest,
      rowsSelected,
      selectionType,
      allowSelection,
      selectionColWidth,
      pageSize,
      curPage,
      widgetName,
    },
    props.id,
    {
      setRowsSelected: handleRowsSelection,
      setSelectionType,
      setAllowSelection,
      setPageSize: updatePageSize,
      setCurPage: updatePageNumber,
    },
  );
  const headerStyle = values?.styles?.headerStyle;

  useEffect(() => {
    setPageSize(values?.pageSize || 10);
    setCurPage(values?.curPage || 1);
  }, [values?.pageSize, values?.curPage]);

  // initialize bindings
  useEffect(() => {
    if (values?.allowSelection !== undefined) {
      setAllowSelection(values.allowSelection);
    }
    if (values?.selectionType !== undefined) {
      setSelectionType(values.selectionType);
    }
  }, [values?.allowSelection, values?.selectionType]);

  // handle column resize
  const handleResize =
    (index: number) =>
    (e: React.SyntheticEvent, { size }: { size: { width: number } }) => {
      const prevColWidths = { ...colWidth };
      prevColWidths[index] = size.width;
      setColWidth(prevColWidths);
    };

  // handle page change
  const handlePageChange = (page: number, newPageSize: number): void => {
    const nextPage = newPageSize !== pageSize ? 1 : page;
    setCurPage(nextPage);
    setPageSize(newPageSize);
    onPageChangeActionCallback(nextPage, newPageSize || 10);
  };

  // handle onChange event on table
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

  // pagination object
  const paginationObject = useMemo(() => {
    const { hidePagination, totalRows } = values ?? {};

    if (hidePagination || !pageSize) {
      return false;
    }

    return {
      onChange: handlePageChange,
      pageSize,
      total: totalRows,
      current: curPage,
      showSizeChanger: true, // always show pagination options (otherwise it defaults to total > 50)
    };
  }, [values, pageSize, curPage, resolvedWidgetId]);

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

  const handleRowSelectableOrNot = useCallback(
    (record: unknown): boolean => {
      const { disableSelection } = itemTemplate.template.properties;

      if (!disableSelection) return false;
      if (disableSelection === true) return true;

      return evaluate(
        defaultScreenContext,
        disableSelection,
        record as { [key: string]: unknown },
      );
    },
    [itemTemplate.template],
  );

  return (
    <div id={resolvedWidgetId} ref={containerRef}>
      <div ref={rootRef}>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                rowHoverBg: values?.styles?.rowHoverBg,
                rowSelectedHoverBg: values?.styles?.rowSelectedHoverBg,
              },
            },
          }}
        >
          <Table
            components={components}
            dataSource={namedData}
            key={resolvedWidgetId}
            onChange={onChange}
            onRow={(record, recordIndex) => ({
              "data-index": recordIndex,
              "data-record": record,
              "data-styles": itemTemplate.template.properties.styles,
              onClick: itemTemplate.template.properties.onTap
                ? (): unknown => onTapActionCallback(record, recordIndex)
                : undefined,
            })}
            pagination={paginationObject}
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
                    columnWidth: values?.selectionColWidth,
                    type: selectionType,
                    onChange: (selectedRowKeys, selectedRows): void => {
                      setRowsKey(selectedRowKeys);
                      setRowsSelected(selectedRows);
                      if (rest.onRowsSelected) {
                        onRowsSelectedCallback(selectedRowKeys, selectedRows);
                      }
                    },
                    getCheckboxProps: (record) => {
                      return {
                        disabled: handleRowSelectableOrNot(record),
                      };
                    },
                    defaultSelectedRowKeys: values?.defaultSelectedRowKeys,
                    selectedRowKeys: rowsKey.length ? rowsKey : undefined,
                  }
                : undefined
            }
            scroll={
              values?.scroll
                ? {
                    y: values.scroll.scrollHeight,
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
            tableLayout="auto"
            virtual={values?.virtual}
          >
            {dataColumns.map((col, colIndex) => {
              return (
                <Table.Column
                  dataIndex={itemTemplate.name}
                  filters={col.filter?.values.map(({ label, value }) => ({
                    text: label,
                    value,
                  }))}
                  hidden={col.visible === false}
                  key={colIndex}
                  minWidth={col.width ?? 100}
                  onFilter={
                    col.filter?.onFilter
                      ? (value, record): boolean =>
                          Boolean(
                            evaluate(
                              defaultScreenContext,
                              col.filter?.onFilter,
                              {
                                value,
                                record,
                                [itemTemplate.name]: get(
                                  record,
                                  itemTemplate.name,
                                ) as unknown,
                              },
                            ),
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
                  shouldCellUpdate={(record, prev) => !isEqual(record, prev)}
                  sorter={
                    col.sort?.compareFn
                      ? (a, b): number =>
                          Number(
                            evaluate(
                              defaultScreenContext,
                              col.sort?.compareFn,
                              {
                                a,
                                b,
                              },
                            ),
                          )
                      : undefined
                  }
                  title={col.label as string | React.ReactNode}
                  width={col.width}
                />
              );
            })}
          </Table>
        </ConfigProvider>
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
          #${resolvedWidgetId} table {
              border-collapse: collapse;
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
    </div>
  );
};

WidgetRegistry.register(widgetName, DataGrid);
