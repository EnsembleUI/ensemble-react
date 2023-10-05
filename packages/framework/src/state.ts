import { atom, createStore } from "jotai";
import { focusAtom } from "jotai-optics";
import type { Response } from "./data";
import type { EnsembleAppModel, EnsembleScreenModel } from "./shared/models";

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

export interface ApplicationContextDefinition {
  application: EnsembleAppModel | null;
  storage: unknown;
  secrets: unknown;
  env: unknown;
  auth: unknown;
  user: unknown;
}

export interface ApplicationContextActions {
  setApplication: (app: EnsembleAppModel) => void;
}

export type ScreenContextType = ScreenContextActions & ScreenContextDefinition;
export type ApplicationContextType = ApplicationContextActions &
  ApplicationContextDefinition;

export interface EnsembleDataContext {
  screen: ScreenContextType;
  app: ApplicationContextType;
}
interface WidgetState<T = Record<string, unknown>> {
  values: T;
  invokable: Invokable;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export type InvokableMethods = Record<string, Function>;
export interface Invokable {
  id: string;
  methods?: InvokableMethods;
}

export const screenAtom = atom<ScreenContextDefinition>({
  screenModel: null,
  data: {},
  widgets: {},
  storage: {},
});

export const screenDataAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("data"),
);

export const appAtom = atom<ApplicationContextDefinition>({
  application: null,
  storage: null,
  env: null,
  auth: null,
  user: null,
  secrets: null,
});

export const ensembleStore = createStore();
