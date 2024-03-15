import { CustomThemeContext, useThemeScope } from "@ensembleui/react-framework";
import { ConfigProvider } from "antd";
import { type PropsWithChildren } from "react";

const DEFAULT_FONT_FAMILY = "sans-serif";

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const themeScope = useThemeScope();

  if (!themeScope.theme) {
    return (
      <CustomThemeContext.Provider value={themeScope}>
        <ConfigProvider>{children}</ConfigProvider>
      </CustomThemeContext.Provider>
    );
  }

  return (
    <CustomThemeContext.Provider value={themeScope}>
      <ConfigProvider
        theme={{
          token: {
            fontFamily:
              themeScope.theme.Tokens?.Typography?.fontFamily ??
              DEFAULT_FONT_FAMILY,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </CustomThemeContext.Provider>
  );
};
