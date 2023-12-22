import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { EnsembleAppModel, EnsembleEnvironmentDTO } from "../shared";

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

export const envAtom = focusAtom(appAtom, (optic) => optic.prop("env"));
