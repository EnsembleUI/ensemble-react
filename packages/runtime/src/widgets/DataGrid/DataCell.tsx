import type { CustomScope } from "@ensembleui/react-framework";
import {
  CustomScopeProvider,
  useCustomScope,
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
  data,
  template,
  columnIndex,
}) => {
  const cellTemplate = template.properties.children[columnIndex];
  const scope = useCustomScope();
  return (
    <CustomScopeProvider
      value={{ ...(data as object), ...scope } as CustomScope}
    >
      {EnsembleRuntime.render([cellTemplate])}
    </CustomScopeProvider>
  );
};
