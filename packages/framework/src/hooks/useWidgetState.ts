import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { useMemo } from "react";
import type { WidgetState, ScreenContextDefinition } from "../state";
import { screenAtom } from "../state";

export const useWidgetState = <T extends Record<string, unknown>>(
  id: string,
): [WidgetState<T> | undefined, (state: WidgetState<T>) => void] => {
  const widgetStateAtom = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      focusAtom<ScreenContextDefinition, WidgetState<T> | undefined, void>(
        screenAtom,
        // Generic typing is too complex here to properly type
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        (optic) => optic.path("widgets", id) as any,
      ),
    [id],
  );

  return useAtom(widgetStateAtom);
};
