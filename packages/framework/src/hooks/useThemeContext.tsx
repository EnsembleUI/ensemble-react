import React, { createContext, useContext } from "react";
import { type EnsembleThemeModel } from "../shared";

export type CustomTheme = Record<string, unknown> & {
  theme?: EnsembleThemeModel;
  themeName?: string;
  setTheme?: (name: string) => void;
};
export const CustomThemeContext = createContext<CustomTheme>({});

type CustomThemeProps = {
  value?: CustomTheme;
} & React.PropsWithChildren<CustomTheme>;
export const CustomThemeProvider: React.FC<CustomThemeProps> = ({
  children,
  value,
}) => {
  return (
    <CustomThemeContext.Provider value={{ ...value }}>
      {children}
    </CustomThemeContext.Provider>
  );
};

export const useCustomTheme = (): CustomTheme => {
  return useContext(CustomThemeContext);
};
