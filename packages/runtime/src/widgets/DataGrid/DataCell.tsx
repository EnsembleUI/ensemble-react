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
    context: data,
  });

  return (
    <>
      {children ? (
        <CustomScopeProvider value={data as CustomScope}>
          {EnsembleRuntime.render([children[columnIndex]])}
        </CustomScopeProvider>
      ) : null}

      {isObject(itemTemplate) && !isEmpty(namedData) && (
        <CustomScopeProvider value={namedData[columnIndex] as CustomScope}>
          {EnsembleRuntime.render([itemTemplate.template])}
        </CustomScopeProvider>
      )}
    </>
  );
};
