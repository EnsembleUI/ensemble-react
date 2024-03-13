import {
  CustomThemeProvider,
  useThemeScope,
} from "@ensembleui/react-framework";
import { ConfigProvider } from "antd";
import { type PropsWithChildren } from "react";

const DEFAULT_FONT_FAMILY = "sans-serif";

export const EnsembleTheme: React.FC<PropsWithChildren> = ({ children }) => {
  const themeScope = useThemeScope();

  if (!themeScope.theme) {
    return (
      <CustomThemeProvider value={themeScope}>
        <ConfigProvider>{children}</ConfigProvider>
      </CustomThemeProvider>
    );
  }

  return (
    <CustomThemeProvider value={themeScope}>
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
    </CustomThemeProvider>
  );
};
