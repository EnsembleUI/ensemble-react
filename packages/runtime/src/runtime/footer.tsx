import type { EnsembleFooterModel } from "@ensembleui/react-framework";
import { Column } from "../widgets";

interface EnsembleFooterProps {
  footer?: EnsembleFooterModel;
}

export const EnsembleFooter: React.FC<EnsembleFooterProps> = ({ footer }) => {
  const FooterWidget = prepareFooter(footer);

  return FooterWidget ? <>{FooterWidget}</> : null;
};

const prepareFooter = (
  footer: EnsembleFooterModel | undefined,
): React.ReactElement | undefined => {
  if (!footer) return;

  // default footer styles
  const defaultStyles = {
    styles: {
      position: "static",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: footer?.styles?.width || "100%",
      backgroundColor: footer?.styles?.backgroundColor || "white",
      height: footer?.styles?.height || "56px",
      bottom: 0,
    },
  };

  return <Column {...defaultStyles} children={footer.children} />;
};
