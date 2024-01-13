import type { RefCallback } from "react";
import { mapKeys, isObject } from "lodash-es";
import { useCallback } from "react";

export const useHtmlPassThrough = (
  testId?: string,
  htmlAttributes?: Record<string, string>,
): { rootRef: RefCallback<never> } => {
  const rootRef = useCallback(
    (node: never) => {
      if (node && "setAttribute" in node) {
        if (isObject(htmlAttributes)) {
          const htmlAttributesObj = mapKeys(htmlAttributes, (_, key) =>
            key.toLowerCase(),
          );

          Object.keys(htmlAttributesObj).forEach((key: string) => {
            (node as HTMLElement).setAttribute(key, htmlAttributesObj[key]);
          });
        }

        if (testId) {
          (node as HTMLElement).setAttribute("data-testid", testId);
        }
      }
    },
    [testId, htmlAttributes],
  );

  return { rootRef };
};
