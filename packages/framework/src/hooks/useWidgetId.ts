import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";

export const useWidgetId = (
  id?: string,
): { resolvedWidgetId: string; rootRef: RefObject<never> } => {
  const resolvedWidgetId = useMemo<string>(() => {
    if (id) {
      return id;
    }
    return generateRandomString(6);
  }, [id]);

  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current && "setAttribute" in rootRef.current) {
      (rootRef.current as HTMLElement).setAttribute(
        "data-testid",
        resolvedWidgetId,
      );
    }
  }, [rootRef, resolvedWidgetId]);

  return { resolvedWidgetId, rootRef };
};

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateRandomString = (length: number): string => {
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};
