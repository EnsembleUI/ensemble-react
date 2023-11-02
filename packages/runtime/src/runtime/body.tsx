import type {
  EnsembleFooterModel,
  EnsembleHeaderModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { set } from "lodash-es";
import { WidgetRegistry } from "../registry";

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
  if (!(BodyFn instanceof Function)) {
    throw new Error(`Unknown widget: ${body?.name}`);
  }

  prepareBody(body, header, footer);

  return <BodyFn {...body?.properties} />;
};

const prepareBody = (
  body?: EnsembleWidget,
  header?: EnsembleHeaderModel,
  footer?: EnsembleFooterModel,
): void => {
  if (!body) return body;

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
    height: `calc(100vh - ${marginTop} - ${marginBottom})`,
    overflow: "auto",
  };

  set(body, ["properties", "styles"], defaultStyles);
};
