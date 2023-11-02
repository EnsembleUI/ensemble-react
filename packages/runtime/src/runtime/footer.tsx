import type {
  EnsembleFooterModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";

interface EnsembleFooterProps {
  footer?: EnsembleFooterModel;
}

export const EnsembleFooter: React.FC<EnsembleFooterProps> = ({ footer }) => {
  const footerWidget = prepareFooter(footer);
  const FooterFn = WidgetRegistry.find(footerWidget?.name ?? "");

  return (
    <>
      {footerWidget && FooterFn instanceof Function && (
        <FooterFn {...footerWidget.properties} />
      )}
    </>
  );
};

const prepareFooter = (
  footer: EnsembleFooterModel | undefined,
): EnsembleWidget | undefined => {
  if (!footer) return;

  // default footer styles
  const defaultStyles = {
    position: "static",
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: footer?.styles?.width || "100%",
    backgroundColor: footer?.styles?.backgroundColor || "white",
    height: footer?.styles?.height || "56px",
    top: `calc(100vh - ${
      (typeof footer?.styles?.height === "number"
        ? footer?.styles?.height + "px"
        : footer?.styles?.height) || "56px"
    })`,
  };

  return {
    name: "Column",
    properties: {
      styles: defaultStyles,
      children: footer.children,
    },
  };
};
