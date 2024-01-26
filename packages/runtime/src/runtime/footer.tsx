import type { EnsembleFooterModel } from "@ensembleui/react-framework";
// eslint-disable-next-line import/no-cycle
import { Column } from "../widgets/Column";

interface EnsembleFooterProps {
  footer?: EnsembleFooterModel;
}

export const EnsembleFooter: React.FC<EnsembleFooterProps> = ({ footer }) => {
  if (!footer) {
    return null;
  }

  return (
    <Column
      styles={{
        position: "static",
        display: "flex",
        justifyContent: "center",
        width: footer.styles?.width || "100%",
        backgroundColor: footer.styles?.backgroundColor || "white",
        height: footer.styles?.height,
        bottom: 0,
      }}
    >
      {footer.children}
    </Column>
  );
};
