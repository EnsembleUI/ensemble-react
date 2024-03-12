import type { PropsWithChildren } from "react";
import { ConfigProvider } from "antd";
import {
  CustomThemeProvider,
  useThemeContext,
} from "@ensembleui/react-framework";

const DEFAULT_FONT_FAMILY = "sans-serif";

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const theme = useThemeContext();

  if (!theme?.theme) {
    return (
      <CustomThemeProvider value={{ ...theme }}>
        <ConfigProvider>{children}</ConfigProvider>
      </CustomThemeProvider>
    );
  }

  return (
    <CustomThemeProvider value={theme}>
      <ConfigProvider
        theme={{
          token: {
            fontFamily:
              theme?.theme.Tokens?.Typography?.fontFamily ??
              DEFAULT_FONT_FAMILY,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </CustomThemeProvider>
  );
};
