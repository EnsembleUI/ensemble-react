import { useCallback } from "react";
import { clone } from "lodash-es";
import { atom, useAtom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared";
import type { EnsembleUser } from "./user";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

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

export const currentThemeAtom = atomWithStorage<string>(
  "ensemble.currentTheme",
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
  const [themeName, updateThemeName] = useAtom(currentThemeAtom);
  const appContext = useAtomValue(appAtom);

  const setTheme = useCallback(
    (name: string) => {
      updateThemeName(name);

      let newTheme = undefined;
      if (appContext.application?.themes) {
        newTheme = appContext?.application?.themes
          ? appContext.application.themes[name]
          : undefined;
      } else {
        newTheme = appContext.application?.theme;
      }

      updateTheme(clone(newTheme));
    },
    [updateTheme, updateThemeName],
  );

  return { theme, themeName, setTheme };
};
