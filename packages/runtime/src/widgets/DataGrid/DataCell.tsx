import { isEmpty, isObject } from "lodash-es";
import type { CustomScope } from "@ensembleui/react-framework";
import {
  CustomScopeProvider,
  useTemplateData,
} from "@ensembleui/react-framework";
import { memo } from "react";
import { EnsembleRuntime } from "../../runtime";
import type { DataGridRowTemplate } from "./DataGrid";

export interface DataCellProps {
  scopeName: string;
  data: unknown;
  template: DataGridRowTemplate;
  columnIndex: number;
  rowIndex: number;
}

export const DataCell: React.FC<DataCellProps> = memo(
  ({ template, columnIndex, rowIndex, data }) => {
    const { "item-template": itemTemplate, children } = template.properties;
    const { namedData } = useTemplateData({
      ...itemTemplate,
      context: data,
    });

    if (children) {
      return (
        <CustomScopeProvider
          value={{ ...(data as object), index: rowIndex } as CustomScope}
        >
          {EnsembleRuntime.render([children[columnIndex]])}
        </CustomScopeProvider>
      );
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      return (
        <CustomScopeProvider
          value={
            {
              ...namedData[columnIndex],
              index: rowIndex,
            } as CustomScope
          }
        >
          {EnsembleRuntime.render([itemTemplate.template])}
        </CustomScopeProvider>
      );
    }

    return null;
  },
);

DataCell.displayName = "DataCell";
