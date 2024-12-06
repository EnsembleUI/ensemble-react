import { useAtom } from "jotai";
import { createContext } from "react";
import { type EnsembleThemeModel } from "../shared";
import { defaultThemeDefinition, themeAtom } from "../state";

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
  const [theme, setTheme] = useAtom(themeAtom);

  return {
    theme,
    themeName: theme.name,
    setTheme,
  };
};
