import { useCallback } from "react";
import { clone } from "lodash-es";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { atom, useAtom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared";
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

export const themeAtom = atom<EnsembleThemeModel | undefined>(undefined);

const backingStorage = createJSONStorage<string>(() => sessionStorage);
export const selectedThemeNameAtom = atomWithStorage<string>(
  "ensemble.selectedThemeName",
  "default",
  backingStorage,
);

export const envAtom = focusAtom(appAtom, (optic) => optic.prop("env"));

export const useThemeContext = (): {
  theme: EnsembleThemeModel | undefined;
  themeName: string;
  setTheme: (name: string) => void;
} => {
  const [theme, updateTheme] = useAtom(themeAtom);
  const [themeName, updateThemeName] = useAtom(selectedThemeNameAtom);
  const appContext = useAtomValue(appAtom);

  const setTheme = useCallback(
    (name: string) => {
      updateThemeName(name);

      let newTheme = appContext.application?.theme;
      if (appContext.application?.themes) {
        newTheme = appContext.application.themes[name];
      }

      updateTheme(clone(newTheme));
    },
    [updateTheme, updateThemeName],
  );

  return { theme, themeName, setTheme };
};
