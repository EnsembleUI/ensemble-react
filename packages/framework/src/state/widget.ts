import { focusAtom } from "jotai-optics";
import { atomFamily } from "jotai/utils";
import { screenAtom } from "./screen";

export interface WidgetState<T = { [key: string]: unknown }> {
  values: T;
  invokable: Invokable;
}

export interface InvokableMethods {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key: string]: Function;
}
export interface Invokable {
  id: string;
  methods?: InvokableMethods;
}

export const widgetFamilyAtom = atomFamily((id: string) =>
  focusAtom(screenAtom, (optics) => optics.path("widgets", id).optional()),
);
