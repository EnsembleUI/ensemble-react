import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared";
import type { EnsembleUser } from "./user";
import { useMockResponse } from "../hooks";

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
  useMockResponse: useMockResponse
};

export const appAtom = atom<ApplicationContextDefinition>(
  defaultApplicationContext,
);

export const themeAtom = atom<EnsembleThemeModel | undefined>(undefined);

const backingStorage = createJSONStorage<string>(() => sessionStorage);
export const selectedThemeNameAtom = atomWithStorage<string>(
  "ensemble.selectedThemeName",
  "default",
  backingStorage,
);

export const envAtom = focusAtom(appAtom, (optic) => optic.prop("env"));

export const secretAtom = focusAtom(appAtom, (optic) => optic.prop("secrets"));
