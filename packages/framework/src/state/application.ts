import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared";
import type { EnsembleUser } from "./user";

export const defaultThemeDefinition = { name: "default" };

export interface ApplicationContextDefinition {
  application: EnsembleAppModel | null;
  storage: unknown;
  secrets: unknown;
  env: { [key: string]: unknown };
  auth: unknown;
  user: EnsembleUser | null;
  useMockResponse: boolean;
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
  secrets: {},
  useMockResponse: false,
};

export const appAtom = atom<ApplicationContextDefinition>(
  defaultApplicationContext,
);

export const themeAtom = atom<EnsembleThemeModel>(defaultThemeDefinition);

export const envAtom = focusAtom(appAtom, (optic) => optic.prop("env"));

export const secretAtom = focusAtom(appAtom, (optic) => optic.prop("secrets"));
