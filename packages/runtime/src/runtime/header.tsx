import type { EnsembleHeaderModel } from "@ensembleui/react-framework";
import { isObject } from "lodash-es";
import { Column } from "../widgets";

interface EnsembleHeaderProps {
  header?: EnsembleHeaderModel;
}

export const EnsembleHeader: React.FC<EnsembleHeaderProps> = ({ header }) => {
  const HeaderWidget = prepareHeader(header);

  return HeaderWidget ? <>{HeaderWidget}</> : null;
};

const prepareHeader = (
  header: EnsembleHeaderModel | undefined,
): React.ReactElement | undefined => {
  const title = header?.title;
  if (!title) return;

  // default header styles
  const defaultStyles = {
    styles: {
      position: "static",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: header?.styles?.centerTitle ? "center" : "flex-start",
      backgroundColor: header?.styles?.backgroundColor || "white",
      height: header?.styles?.titleBarHeight || 56,
    },
  };

  if (typeof title === "string")
    return (
      <Column
        {...defaultStyles}
        children={[
          {
            name: "Text",
            properties: {
              text: title,
              styles: {
                color: header?.styles?.titleColor || "black",
              },
            },
          },
        ]}
      />
    );
  else if (isObject(title))
    return <Column {...defaultStyles} children={[title]} />;
  return;
};
