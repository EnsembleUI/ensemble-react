import { atom } from "jotai";
import { selectAtom, atomWithStorage } from "jotai/utils";
import type { EnsembleAppModel, EnsembleEnvironmentDTO } from "../shared";
import { backingStorage } from "../hooks/useEnsembleStorage";

export interface ApplicationContextDefinition {
  application: EnsembleAppModel | null;
  storage: unknown;
  secrets: unknown;
  env: EnsembleEnvironmentDTO | null;
  auth: unknown;
  user: unknown;
}

export interface ApplicationContextActions {
  setApplication: (app: EnsembleAppModel) => void;
}

export const defaultApplicationContext = {
  application: null,
  storage: null,
  env: null,
  auth: null,
  user: null,
  secrets: null,
};

export const appAtom = atom<ApplicationContextDefinition>(
  defaultApplicationContext,
);

export const themeAtom = selectAtom(appAtom, (appContext) => {
  return appContext.application?.theme;
});

export const envAtom = atomWithStorage<
  EnsembleEnvironmentDTO & Record<string, unknown>
>("ensemble.env", {}, backingStorage, {
  unstable_getOnInit: true,
});
