import { useMemo } from "react";
import {
  useRegisterBindings,
  type Expression,
} from "@ensembleui/react-framework";
import { isEmpty } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";

const widgetName = "Html";

interface HtmlCssSelectorStyle {
  selector: Expression<string>;
  properties: React.CSSProperties;
}

export type HtmlProps = {
  text: Expression<string>;
  cssStyles?: HtmlCssSelectorStyle[];
} & EnsembleWidgetProps;

export const Html: React.FC<HtmlProps> = (props) => {
  const { values, rootRef } = useRegisterBindings(
    { ...props, widgetName },
    props.id,
    {},
  );

  const cssStyles = useMemo(() => {
    return (values?.cssStyles || []).reduce((styles, item) => {
      const properties = Object.entries(item.properties)
        .map(([key, value]) => {
          // Convert camelCase to kebab-case for CSS properties
          const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          return `${cssKey}: ${String(value)}`;
        })
        .join(";");

      return `${styles}
        ${item.selector} {
          ${properties}
        }
      `;
    }, "");
  }, [values?.cssStyles]);

  return (
    <>
      {!isEmpty(cssStyles) && <style>{cssStyles}</style>}
      <div
        dangerouslySetInnerHTML={{ __html: values?.text || "" }}
        ref={rootRef}
        style={values?.styles}
      />
    </>
  );
};

WidgetRegistry.register(widgetName, Html);
