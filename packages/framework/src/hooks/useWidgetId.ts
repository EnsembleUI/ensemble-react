import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import { error } from "../shared";

export const useWidgetId = (
  id?: string,
): { resolvedWidgetId: string; rootRef: RefObject<never> } => {
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

  const rootRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (rootRef.current && "setAttribute" in rootRef.current) {
      (rootRef.current as HTMLElement).setAttribute(
        "data-testid",
        resolvedWidgetId,
      );
    }
  }, [rootRef, resolvedWidgetId]);

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
