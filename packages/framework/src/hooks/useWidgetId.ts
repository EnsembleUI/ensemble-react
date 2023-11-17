import type { RefCallback } from "react";
import { useCallback, useMemo } from "react";
import { error } from "../shared";

export const useWidgetId = (
  id?: string,
): { resolvedWidgetId: string; rootRef: RefCallback<never> } => {
  const resolvedWidgetId = useMemo<string>(() => {
    if (id && JS_ID_REGEX.test(id)) {
      return id;
    }
    if (id) {
      error(
        `${id} is not a valid javascript identifier. generating a random one`,
      );
    }
    return generateRandomString(6);
  }, [id]);

  const rootRef = useCallback(
    (node: never) => {
      if (node && "setAttribute" in node) {
        (node as HTMLElement).setAttribute("data-testid", resolvedWidgetId);
      }
    },
    [resolvedWidgetId],
  );

  return { resolvedWidgetId, rootRef };
};

const JS_ID_REGEX = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateRandomString = (length: number): string => {
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};
