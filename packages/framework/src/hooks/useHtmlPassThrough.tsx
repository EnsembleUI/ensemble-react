import type { RefCallback } from "react";
import { isEmpty } from "lodash-es";
import { useCallback } from "react";
import type { Expression } from "../shared";

export const useHtmlPassThrough = (
  resolvedTestId: string | undefined,
  resolvedWidgetId: string,
  id?: Expression<string>,
  htmlAttributes?: Record<string, string>,
): { rootRef: RefCallback<never> } => {
  const rootRef = useCallback(
    (node: never) => {
      if (node && "setAttribute" in node) {
        (node as HTMLElement).setAttribute(
          "data-testid",
          id ? resolvedWidgetId : resolvedTestId ?? "",
        );

        if (!isEmpty(htmlAttributes)) {
          Object.keys(htmlAttributes).forEach((key: string) => {
            (node as HTMLElement).setAttribute(
              `data-${key}`,
              htmlAttributes[key],
            );
          });
        }
      }
    },
    [id, resolvedTestId, resolvedWidgetId, htmlAttributes],
  );

  return { rootRef };
};
