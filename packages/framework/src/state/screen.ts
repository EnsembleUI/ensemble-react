import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import type { Response } from "../data";
import type { EnsembleScreenModel } from "../shared";
import type { WidgetState } from "./widget";

export interface ScreenContextDefinition {
  model?: EnsembleScreenModel;
  data: Record<string, Response | undefined>;
  widgets: Record<string, WidgetState | undefined>;
  storage: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ScreenContextActions {
  setWidget: (id: string, state: WidgetState) => void;
  setData: (name: string, response: Response) => void;
  setCustom: (id: string, data: unknown) => void;
}

export const screenAtom = atom<ScreenContextDefinition>({
  model: undefined,
  data: {},
  widgets: {},
  storage: {},
});

export const screenDataAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("data"),
);
