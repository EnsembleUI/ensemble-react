import { useAtom } from "jotai";
import type { WidgetState } from "../state";
import { widgetFamilyAtom } from "../state";

export const useWidgetState = <T extends Record<string, unknown>>(
  id: string,
): [WidgetState<T> | undefined, (state: WidgetState<T>) => void] => {
  const widgetState = useAtom(widgetFamilyAtom(id));
  return widgetState as [
    WidgetState<T> | undefined,
    (state: WidgetState<T>) => void,
  ];
};
