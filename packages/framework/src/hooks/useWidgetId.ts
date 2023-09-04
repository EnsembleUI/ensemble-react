import { useMemo } from "react";

export const useWidgetId = (id?: string): string => {
  const resolvedId = useMemo<string>(() => {
    if (id) {
      return id;
    }
    return crypto.randomUUID();
  }, [id]);
  return resolvedId;
};
