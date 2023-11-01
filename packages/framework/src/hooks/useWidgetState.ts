import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { useEffect, useMemo } from "react";
import type { WidgetState, ScreenContextDefinition } from "../state";
import { locationAtom, screenAtom } from "../state";

export const useWidgetState = <T extends Record<string, unknown>>(
  id: string,
): [WidgetState<T> | undefined, (state: WidgetState<T>) => void] => {
  const [location] = useAtom(locationAtom);
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

  const widgetState = useAtom(widgetStateAtom);
  const [, setWidgetState] = widgetState;

  useEffect(() => {
    return () => setWidgetState(undefined);
  }, [location.pathname, setWidgetState]);

  return widgetState;
};
