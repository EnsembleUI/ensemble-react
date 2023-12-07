import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import type { EnsembleAppModel } from "../shared";

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
