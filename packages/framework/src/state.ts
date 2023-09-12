import type { Mutate, StateCreator, StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { merge } from "lodash-es";
import type { Application } from "./models";
import { Response } from "./data";

export interface ScreenContextDefinition {
  data: Record<string, Response | undefined>;
  widgets: Record<string, WidgetState | undefined>;
}

export interface ScreenContextActions {
  setWidget: (id: string, state: WidgetState) => void;
  setData: (name: string, response: Response) => void;
}

export interface ApplicationContextDefinition {
  application: Application | null;
  storage: unknown;
  secrets: unknown;
  env: unknown;
  auth: unknown;
  user: unknown;
}

export interface ApplicationContextActions {
  setApplication: (app: Application) => void;
}

export type ScreenContextType = ScreenContextActions & ScreenContextDefinition;
export type ApplicationContextType = ApplicationContextActions &
  ApplicationContextDefinition;

export interface EnsembleDataContext {
  screen: ScreenContextType;
  app: ApplicationContextType;
}

export type StateSlice<T> = StateCreator<
  EnsembleDataContext,
  [["zustand/immer", never]],
  [],
  T
>;

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

const createApplicationContext: StateSlice<ApplicationContextType> = (set) => ({
  application: null,
  storage: null,
  env: null,
  auth: null,
  user: null,
  secrets: null,

  setApplication: (application: Application) => set(() => ({ application })),
});

const createScreenContext: StateSlice<ScreenContextType> = (set) => ({
  data: {},
  widgets: {},

  setWidget: (id: string, widgetState: WidgetState) =>
    set((state) => {
      const prevState = state.screen.widgets[id];
      if (prevState) {
        merge(prevState, widgetState);
      } else {
        state.screen.widgets[id] = widgetState;
      }
    }),
  setData: (name: string, response: Response) =>
    set((state) => {
      const prevResponse = state.screen.data[name];
      if (prevResponse) {
        merge(prevResponse, response);
      } else {
        state.screen.data[name] = response;
      }
    }),
});

export const useEnsembleStore: UseBoundStore<
  Mutate<StoreApi<EnsembleDataContext>, []>
> = create<EnsembleDataContext>()(
  immer((...a) => ({
    app: createApplicationContext(...a),
    screen: createScreenContext(...a),
  })),
);
