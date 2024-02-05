import type { CustomScope } from "@ensembleui/react-framework";
import { CustomScopeProvider } from "@ensembleui/react-framework";
import { EnsembleRuntime } from "../../runtime";
import type { DataGridRowTemplate } from "./DataGrid";

export interface DataCellProps {
  scopeName: string;
  data: unknown;
  template: DataGridRowTemplate;
  columnIndex: number;
  rowIndex: number;
}
export const DataCell: React.FC<DataCellProps> = ({
  data,
  template,
  columnIndex,
  rowIndex,
}) => {
  const cellTemplate = template.properties.children[columnIndex];
  return (
    <CustomScopeProvider
      value={{ ...(data as object), index: rowIndex } as CustomScope}
    >
      {EnsembleRuntime.render([cellTemplate])}
    </CustomScopeProvider>
  );
};
