import { CustomScopeProvider } from "framework";
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
  return (
    <CustomScopeProvider value={data}>
      {EnsembleRuntime.render([cellTemplate])}
    </CustomScopeProvider>
  );
};
