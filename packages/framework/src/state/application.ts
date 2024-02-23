import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { EnsembleAppModel } from "../shared";
import type { EnsembleUser } from "./user";

export interface ApplicationContextDefinition {
  application: EnsembleAppModel | null;
  storage: unknown;
  secrets: unknown;
  env: Record<string, unknown>;
  auth: unknown;
  user: EnsembleUser | null;
}

export interface ApplicationContextActions {
  setApplication: (app: EnsembleAppModel) => void;
}

export const defaultApplicationContext = {
  application: null,
  storage: null,
  env: {},
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
