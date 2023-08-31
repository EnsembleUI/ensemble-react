import type { StateCreator } from "zustand";
import { create } from "zustand";
import type { Application } from "./models";

export interface ApplicationContext {
  application: Application | null;
  storage: unknown;
  secrets: unknown;
  env: unknown;
  auth: unknown;
  user: unknown;
}

export interface ApplicationContextMutator {
  setApplication: (app: Application) => void;
}

export interface ScreenContext {
  data: unknown;
  widgets: Record<string, WidgetState>;
}

export interface ScreenContextMutator {
  setWidget: (id: string, state: WidgetState) => void;
}

export type IEnsembleContext = ApplicationContext & ScreenContext;

export type ContextMutator = ApplicationContextMutator & ScreenContextMutator;

interface WidgetState {
  values: Record<string, unknown>;
  invokable: Invokable;
}

export interface Invokable {
  id: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  methods?: Record<string, Function>;
}

const createApplicationContext: StateCreator<
  ApplicationContext,
  [],
  [],
  ApplicationContext & ApplicationContextMutator
> = (set) => ({
  application: null,
  storage: null,
  env: null,
  auth: null,
  user: null,
  secrets: null,

  setApplication: (application: Application) => set(() => ({ application })),
});

const createScreenContext: StateCreator<
  ScreenContext,
  [],
  [],
  ScreenContext & ScreenContextMutator
> = (set) => ({
  data: null,
  widgets: {},

  setWidget: (id: string, widgetState: WidgetState) =>
    set((state) => {
      state.widgets[id] = widgetState;
      return state;
    }),
});

export const useEnsembleStore = create<IEnsembleContext & ContextMutator>()(
  (...a) => ({
    ...createApplicationContext(...a),
    ...createScreenContext(...a),
  }),
);
