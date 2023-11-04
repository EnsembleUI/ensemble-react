import type {
  EnsembleFooterModel,
  EnsembleHeaderModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { Column } from "../widgets";

interface EnsembleBodyProps {
  body?: EnsembleWidget;
  header?: EnsembleHeaderModel;
  footer?: EnsembleFooterModel;
}

export const EnsembleBody: React.FC<EnsembleBodyProps> = ({
  body,
  header,
  footer,
}) => {
  const BodyFn = WidgetRegistry.find(body?.name ?? "");
  if (!(BodyFn instanceof Function))
    throw new Error(`Unknown widget: ${body?.name}`);

  const BodyWidget = prepareBody(body, header, footer);

  return BodyWidget ? <>{BodyWidget}</> : null;
};

const prepareBody = (
  body?: EnsembleWidget,
  header?: EnsembleHeaderModel,
  footer?: EnsembleFooterModel,
): React.ReactElement | undefined => {
  if (!body) return;

  // default body styles
  const marginTop = !header
    ? "0px"
    : !header?.styles?.titleBarHeight
    ? "56px"
    : typeof header?.styles?.titleBarHeight === "number"
    ? header?.styles?.titleBarHeight + "px"
    : header?.styles?.titleBarHeight;
  const marginBottom = !footer
    ? "0px"
    : typeof footer === "string" || !("styles" in footer)
    ? "56px"
    : typeof footer?.styles?.height === "number"
    ? footer?.styles?.height + "px"
    : footer?.styles?.height || "0px";

  // default body styles
  const defaultStyles = {
    styles: {
      height: `calc(100vh - ${marginTop} - ${marginBottom})`,
      overflow: "auto",
    },
  };

  return <Column {...defaultStyles} children={[body]} />;
};
