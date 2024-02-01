import { useMemo } from "react";
import { isEmpty, isObject } from "lodash-es";
import type { CustomScope } from "@ensembleui/react-framework";
import {
  CustomScopeProvider,
  useTemplateData,
} from "@ensembleui/react-framework";
import { EnsembleRuntime } from "../../runtime";
import type { DataGridRowTemplate } from "./DataGrid";

export interface DataCellProps {
  scopeName: string;
  data: unknown;
  template: DataGridRowTemplate;
  columnIndex: number;
}
export const DataCell: React.FC<DataCellProps> = ({
  template,
  columnIndex,
  data,
}) => {
  const { "item-template": itemTemplate, children } = template.properties;
  const { namedData } = useTemplateData({
    ...itemTemplate,
  });

  const cellData = useMemo(() => {
    if (children) {
      return (
        <CustomScopeProvider value={data as CustomScope}>
          {EnsembleRuntime.render([children[columnIndex]])}
        </CustomScopeProvider>
      );
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      return (
        <CustomScopeProvider value={namedData[columnIndex] as CustomScope}>
          {EnsembleRuntime.render([itemTemplate.template])}
        </CustomScopeProvider>
      );
    }
  }, [children, data, namedData, itemTemplate, columnIndex]);

  return <>{cellData}</>;
};
