import { useAtom, useAtomValue } from "jotai";
import { clone, isEmpty } from "lodash-es";
import { createContext, useCallback } from "react";
import { type EnsembleThemeModel } from "../shared";
import { appAtom, selectedThemeNameAtom, themeAtom } from "../state";

export type CustomTheme = { [key: string]: unknown } & {
  theme?: EnsembleThemeModel;
  themeName?: string;
  setTheme?: (name: string) => void;
};
export const CustomThemeContext = createContext<CustomTheme>({});

export const useThemeScope = (): {
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
      if (!isEmpty(appContext.application?.themes)) {
        newTheme = appContext.application?.themes[name];
      }

      updateTheme(clone(newTheme));
    },
    [updateTheme, updateThemeName],
  );

  return { theme, themeName, setTheme };
};
