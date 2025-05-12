import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import { assign } from "lodash-es";
import { atomFamily } from "jotai/utils";
import { type Response, type WebSocketConnection } from "../data";
import type { EnsembleAppModel, EnsembleScreenModel } from "../shared";
import type { WidgetState } from "./widget";

export interface ScreenContextDefinition {
  app?: EnsembleAppModel;
  model?: EnsembleScreenModel;
  data: ScreenContextData;
  widgets: { [key: string]: WidgetState | undefined };
  inputs?: { [key: string]: unknown };
  [key: string]: unknown;
}

export interface ScreenContextData {
  [key: string]: Partial<Response> | WebSocketConnection;
}

export interface ScreenContextActions {
  setWidget: (id: string, state: WidgetState) => void;
  setData: (
    name: string,
    response: Partial<Response> | WebSocketConnection,
  ) => void;
  setCustom: (id: string, data: unknown) => void;
}

export const defaultScreenContext = {
  model: undefined,
  data: {},
  widgets: {},
};

export const screenAtom = atom<ScreenContextDefinition>(defaultScreenContext);

const screenDataFocusAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("data"),
);

export const screenDataAtom = atom(
  (get) => get(screenDataFocusAtom),
  (get, set, update) => {
    const currentData = get(screenDataFocusAtom);
    const nextData = assign({}, currentData, update);
    set(screenDataFocusAtom, nextData);
  },
);

export const screenDataFamilyAtom = atomFamily((id: string) =>
  focusAtom(screenDataFocusAtom, (optics) => optics.path(id)),
);

export const screenModelAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("model"),
);

export const screenApiAtom = focusAtom(screenAtom, (optic) => {
  return optic.prop("model").optional().prop("apis");
});

export const screenSocketAtom = focusAtom(screenAtom, (optic) => {
  return optic.prop("model").optional().prop("sockets");
});

export const screenInputAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("inputs"),
);

export const screenGlobalScriptAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("model").optional().prop("global"),
);

export const screenImportScriptAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("model").optional().prop("importedScripts"),
);
