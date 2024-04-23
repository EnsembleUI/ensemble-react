import type { RefCallback } from "react";
import { mapKeys, isObject, merge } from "lodash-es";
import { useCallback } from "react";
import { error } from "../shared";

export const useHtmlPassThrough = (
  htmlAttributes?: { [key: string]: string },
  testId?: string,
): { rootRef: RefCallback<never> } => {
  const rootRef = useCallback(
    (node: never) => {
      if (node && "setAttribute" in node) {
        if (isObject(htmlAttributes)) {
          if (testId) {
            merge(htmlAttributes, { "data-testid": testId });
          }

          const htmlAttributesObj = mapKeys(htmlAttributes, (_, key) =>
            key.toLowerCase(),
          );

          Object.keys(htmlAttributesObj).forEach((key: string) => {
            try {
              (node as HTMLElement).setAttribute(key, htmlAttributesObj[key]);
            } catch (e) {
              error(e);
            }
          });
        }
      }
    },
    [testId, htmlAttributes],
  );

  return { rootRef };
};
