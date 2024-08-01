import { useAtom, useAtomValue } from "jotai";
import { keys } from "lodash-es";
import { createContext, useCallback } from "react";
import { type EnsembleThemeModel } from "../shared";
import { appAtom, defaultThemeDefinition, themeAtom } from "../state";

export type CustomTheme = { [key: string]: unknown } & {
  theme: EnsembleThemeModel;
  themeName?: string;
  setTheme?: (name: string) => void;
};
export const CustomThemeContext = createContext<CustomTheme>({
  theme: defaultThemeDefinition,
});

export const useThemeScope = (): {
  theme: EnsembleThemeModel;
  themeName: string;
  setTheme: (name: string) => void;
} => {
  const [theme, updateTheme] = useAtom(themeAtom);

  const appContext = useAtomValue(appAtom);

  const setTheme = useCallback(
    (name: string) => {
      if (keys(appContext.application?.themes).includes(name)) {
        const selectedTheme = appContext.application?.themes[name];
        if (selectedTheme) {
          updateTheme(selectedTheme);
        }
      }
    },
    [updateTheme, appContext.application?.themes],
  );

  return { theme, themeName: theme.name, setTheme };
};
