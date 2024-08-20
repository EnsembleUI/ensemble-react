import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import type { Response, WebSocketConnection } from "../data";
import type { EnsembleAppModel, EnsembleScreenModel } from "../shared";
import type { WidgetState } from "./widget";

export interface ScreenContextDefinition {
  app?: EnsembleAppModel;
  model?: EnsembleScreenModel;
  data: ScreenContextData;
  widgets: { [key: string]: WidgetState };
  inputs?: { [key: string]: unknown };
  [key: string]: unknown;
}

export interface ScreenContextData {
  [key: string]: Response | WebSocketConnection;
}

export interface ScreenContextActions {
  setWidget: (id: string, state: WidgetState) => void;
  setData: (name: string, response: Response | WebSocketConnection) => void;
  setCustom: (id: string, data: unknown) => void;
}

export const defaultScreenContext = {
  model: undefined,
  data: {},
  widgets: {},
};

export const screenAtom = atom<ScreenContextDefinition>(defaultScreenContext);

export const screenDataAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("data"),
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
