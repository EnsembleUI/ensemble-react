import type { PropsWithChildren } from "react";
import { ConfigProvider } from "antd";
import { useApplicationContext } from "@ensembleui/react-framework";

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
          colorPrimary: theme.Colors.primary,
          colorPrimaryText: theme.Colors.onPrimary,
          colorTextDisabled: theme.Colors.disabled,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
