import type { EnsembleHeaderModel } from "@ensembleui/react-framework";
import { isObject } from "lodash-es";
// eslint-disable-next-line import/no-cycle
import { Column } from "../widgets/Column";

interface EnsembleHeaderProps {
  header?: EnsembleHeaderModel;
}

export const EnsembleHeader: React.FC<EnsembleHeaderProps> = ({ header }) => {
  if (!header?.title) {
    return null;
  }

  const titleWidget = isObject(header.title)
    ? header.title
    : {
        name: "Text",
        properties: {
          text: header.title,
          styles: {
            color: header.styles?.titleColor || "black",
          },
        },
      };

  return (
    <Column
      styles={{
        position: "static",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: header.styles?.centerTitle ? "center" : "flex-start",
        backgroundColor: header.styles?.backgroundColor || "white",
        height: header.styles?.titleBarHeight || 56,
      }}
    >
      {[titleWidget]}
    </Column>
  );
};
