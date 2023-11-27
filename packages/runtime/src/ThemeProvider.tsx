import type { PropsWithChildren } from "react";
import { ConfigProvider } from "antd";
import { useApplicationContext } from "@ensembleui/react-framework";

const DEFAULT_FONT_FAMILY = "sans-serif";

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useApplicationContext();
  const theme = context?.application?.theme;
  if (!theme) {
    return <ConfigProvider>{children}</ConfigProvider>;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: theme.Tokens.Typography.fontFamily ?? DEFAULT_FONT_FAMILY,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
