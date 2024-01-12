import type { RefCallback } from "react";
import { isEmpty, isString, mapKeys } from "lodash-es";
import { useCallback } from "react";

export const useHtmlPassThrough = (
  widgetId: string,
  htmlAttributes?: Record<string, string>,
): { rootRef: RefCallback<never> } => {
  const rootRef = useCallback(
    (node: never) => {
      if (node && "setAttribute" in node) {
        if (!isEmpty(htmlAttributes) && !isString(htmlAttributes)) {
          const htmlAttributesObj = mapKeys(htmlAttributes, (_, key) =>
            key.toLowerCase(),
          );

          Object.keys(htmlAttributesObj).forEach((key: string) => {
            (node as HTMLElement).setAttribute(key, htmlAttributesObj[key]);
          });
        }

        (node as HTMLElement).setAttribute("data-testid", widgetId);
      }
    },
    [widgetId, htmlAttributes],
  );

  return { rootRef };
};
