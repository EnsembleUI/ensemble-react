import type {
  EnsembleHeaderModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { isObject } from "lodash-es";
import { WidgetRegistry } from "../registry";

interface EnsembleHeaderProps {
  header?: EnsembleHeaderModel;
}

export const EnsembleHeader: React.FC<EnsembleHeaderProps> = ({ header }) => {
  const headerWidget = prepareHeader(header);

  const HeaderFn = WidgetRegistry.find(headerWidget?.name ?? "");

  return (
    <>
      {headerWidget && HeaderFn instanceof Function && (
        <HeaderFn {...headerWidget.properties} />
      )}
    </>
  );
};

const prepareHeader = (
  header: EnsembleHeaderModel | undefined,
): EnsembleWidget | undefined => {
  const title = header?.title;
  if (!title) return;

  // default header styles
  const defaultStyles = {
    position: "static",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: header?.styles?.centerTitle ? "center" : "flex-start",
    backgroundColor: header?.styles?.backgroundColor || "white",
    height: header?.styles?.titleBarHeight || 56,
  };

  if (typeof title === "string") {
    return {
      name: "Column",
      properties: {
        styles: defaultStyles,
        children: [
          {
            name: "Text",
            properties: {
              text: title,
            },
          },
        ],
      },
    };
  } else if (isObject(title)) {
    return {
      name: "Column",
      properties: {
        styles: defaultStyles,
        children: [title],
      },
    };
  }
};
