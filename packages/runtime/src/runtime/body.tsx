import type {
  EnsembleFooterModel,
  EnsembleHeaderModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { Column } from "../widgets/Column";

interface EnsembleBodyProps {
  body: EnsembleWidget;
  header?: EnsembleHeaderModel;
  footer?: EnsembleFooterModel;
  isModal?: boolean;
}

export const EnsembleBody: React.FC<EnsembleBodyProps> = ({
  body,
  header,
  footer,
  isModal,
}) => {
  const BodyFn = WidgetRegistry.find(body.name);
  if (!(BodyFn instanceof Function))
    throw new Error(`Unknown widget: ${body.name}`);

  let marginTop;
  if (!header) {
    marginTop = "0px";
  } else if (!header.styles?.titleBarHeight) {
    marginTop = DEFAULT_HEADER_HEIGHT;
  } else if (typeof header.styles.titleBarHeight === "number") {
    marginTop = `${header.styles.titleBarHeight}px`;
  } else {
    marginTop = header.styles.titleBarHeight;
  }

  let marginBottom;
  if (!footer) {
    marginBottom = "0px";
  } else if (typeof footer === "string" || !footer.styles?.height) {
    marginBottom = DEFAULT_FOOTER_HEIGHT;
  } else if (typeof footer.styles.height === "number") {
    marginBottom = `${footer.styles.height}px`;
  } else {
    marginBottom = footer.styles.height;
  }

  // default body styles
  const defaultStyles = {
    styles: {
      height: !isModal
        ? `calc(100vh - ${marginTop} - ${marginBottom})`
        : undefined,
      overflow: "auto",
    },
  };

  return <Column {...defaultStyles}>{[body]}</Column>;
};

const DEFAULT_FOOTER_HEIGHT = "56px";
const DEFAULT_HEADER_HEIGHT = DEFAULT_FOOTER_HEIGHT;
