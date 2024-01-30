import type {
  EnsembleFooterModel,
  EnsembleHeaderModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
// eslint-disable-next-line import/no-cycle
import { Column } from "../widgets/Column";

interface EnsembleBodyProps {
  body: EnsembleWidget;
  header?: EnsembleHeaderModel;
  footer?: EnsembleFooterModel;
  isModal?: boolean;
}

export const EnsembleBody: React.FC<EnsembleBodyProps> = ({ body }) => {
  const BodyFn = WidgetRegistry.find(body.name);
  if (!(BodyFn instanceof Function))
    throw new Error(`Unknown widget: ${body.name}`);

  // default body styles
  const defaultStyles = {
    styles: {
      flex: 1,
      overflow: "auto",
    },
  };

  return <Column {...defaultStyles}>{[body]}</Column>;
};
