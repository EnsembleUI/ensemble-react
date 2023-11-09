import type { EnsembleHeaderModel } from "@ensembleui/react-framework";
import { isObject } from "lodash-es";
import { Column } from "../widgets/Column";

interface EnsembleHeaderProps {
  header?: EnsembleHeaderModel;
}

export const EnsembleHeader: React.FC<EnsembleHeaderProps> = ({ header }) => {
  if (!header) {
    return null;
  }

  const title = header.title;
  if (!title) return;

  // default header styles
  const defaultStyles = {
    styles: {
      position: "static",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: header.styles?.centerTitle ? "center" : "flex-start",
      backgroundColor: header.styles?.backgroundColor || "white",
      height: header.styles?.titleBarHeight || 56,
    },
  };

  if (typeof title === "string") {
    return (
      <Column {...defaultStyles}>
        {[
          {
            name: "Text",
            properties: {
              text: title,
              styles: {
                color: header.styles?.titleColor || "black",
              },
            },
          },
        ]}
      </Column>
    );
  } else if (isObject(title)) {
    return <Column {...defaultStyles}>{[title]}</Column>;
  }
};
