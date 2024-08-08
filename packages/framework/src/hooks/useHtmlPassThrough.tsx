import type { RefCallback } from "react";
import { mapKeys, isObject, get } from "lodash-es";
import { useCallback } from "react";
import { error } from "../shared";

export const useHtmlPassThrough = (
  htmlAttributes?: { [key: string]: string },
  testId?: string,
): { rootRef: RefCallback<never> } => {
  const rootRef = useCallback(
    (node: never) => {
      let element: any;
      if (node) {
        if ("setAttribute" in node) {
          element = node;
        } else {
          element = get(node, "nativeElement");
        }
      }
      if (element && "setAttribute" in element) {
        if (isObject(htmlAttributes)) {
          const htmlAttributesObj = mapKeys(htmlAttributes, (_, key) =>
            key.toLowerCase(),
          );

          Object.keys(htmlAttributesObj).forEach((key: string) => {
            try {
              (element as HTMLElement).setAttribute(
                key,
                htmlAttributesObj[key],
              );
            } catch (e) {
              error(e);
            }
          });
        }
        if (testId) {
          try {
            (element as HTMLElement).setAttribute("data-testid", testId);
          } catch (e) {
            error(e);
          }
        }
      }
    },
    [testId, htmlAttributes],
  );

  return { rootRef };
};
