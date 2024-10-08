import type { EnsembleHeaderModel } from "@ensembleui/react-framework";
import { isObject } from "lodash-es";
// eslint-disable-next-line import/no-cycle
import { Column } from "../widgets/Column";
import { WidgetRegistry } from "../registry";

interface EnsembleHeaderProps {
  header?: EnsembleHeaderModel;
}

export const EnsembleHeader: React.FC<EnsembleHeaderProps> = ({ header }) => {
  if (!header?.title) {
    return null;
  }

  let titleWidget;
  if (isObject(header.title)) {
    titleWidget = header.title;
  } else if (WidgetRegistry.findOrNull(header.title) !== null) {
    titleWidget = {
      name: header.title,
      properties: {},
    };
  } else {
    titleWidget = {
      name: "Text",
      properties: {
        text: header.title,
        styles: {
          color: header.styles?.titleColor || "black",
          ...header.styles,
        },
      },
    };
  }

  return (
    <Column
      styles={{
        position: "static",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: header.styles?.centerTitle === false ? "normal" : "center",
        backgroundColor: header.styles?.backgroundColor || "white",
        height: header.styles?.titleBarHeight || 56,
      }}
    >
      {[titleWidget]}
    </Column>
  );
};
