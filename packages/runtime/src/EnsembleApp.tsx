import React, { useEffect, useMemo, useState } from "react";
import type {
  ApplicationDTO,
  EnsembleAppModel,
  ApplicationLoader,
  IconDTO,
} from "@ensembleui/react-framework";
import {
  ApplicationContextProvider,
  EnsembleParser,
  queryClient,
} from "@ensembleui/react-framework";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { injectStyle } from "react-toastify/dist/inject-style";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Icons from "@mui/icons-material";
import { ThemeProvider } from "./ThemeProvider";
import { EnsembleEntry } from "./runtime/entry";
import { EnsembleScreen } from "./runtime/screen";
import { ErrorPage } from "./runtime/error";
// Register built in widgets;
import "./widgets";
import type { WidgetComponent } from "./registry";
import { IconRegistry, WidgetRegistry } from "./registry";
import { createCustomWidget } from "./runtime/customWidget";
import { ModalWrapper } from "./runtime/modal";

injectStyle();

export interface EnsembleAppProps {
  appId: string;
  application?: ApplicationDTO;
  path?: string;
  loader?: ApplicationLoader;
  screenId?: string;
  environmentOverrides?: { [key: string]: unknown };
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  appId,
  application,
  path,
  loader,
  screenId,
  environmentOverrides,
}) => {
  const [app, setApp] = useState<EnsembleAppModel>();

  useEffect(() => {
    if (app) {
      return;
    }

    const parseApp = (appDto: ApplicationDTO): void => {
      const parsedApp = EnsembleParser.parseApplication(appDto);
      parsedApp.customWidgets.forEach((customWidget) => {
        WidgetRegistry.register(
          customWidget.name,
          createCustomWidget(customWidget),
        );
      });

      Object.entries(Icons).forEach(([name, icon]) => {
        IconRegistry.register(name, icon as WidgetComponent<unknown>);
      });

      appDto?.icons?.forEach((iconSet: IconDTO) => {
        const { prefix = "", icons = {} } = iconSet;
        Object.entries(icons).forEach(([name, icon]) => {
          IconRegistry.register(
            `${prefix}${name}`,
            icon as WidgetComponent<unknown>,
          );
        });
      });

      setApp(parsedApp);
    };

    if (application) {
      parseApp(application);
      return;
    }

    if (!loader) {
      throw new Error("An application loader must be provided");
    }

    const resolveApp = async (): Promise<void> => {
      const remoteApp = await loader.load(appId);
      parseApp(remoteApp);
    };
    void resolveApp();
  }, [app, appId, application, loader]);

  const router = useMemo(
    () =>
      app
        ? createBrowserRouter(
            [
              {
                path: "/",
                element: (
                  <ModalWrapper>
                    <EnsembleEntry
                      entry={app.home}
                      screen={app.screens.find(
                        (screen) => Boolean(screenId) && screen.id === screenId,
                      )}
                    />
                  </ModalWrapper>
                ),
                errorElement: <ErrorPage />,
                children: app.screens.map((screen) => {
                  const screenPath = screen.path ?? screen.name?.toLowerCase();
                  return {
                    path: screenPath,
                    element: (
                      <EnsembleScreen key={screenPath} screen={screen} />
                    ),
                  };
                }),
              },
            ],
            { basename: path },
          )
        : null,
    [app, path],
  );

  if (!app || !router) {
    return null;
  }

  return (
    <ApplicationContextProvider
      app={app}
      environmentOverrides={environmentOverrides}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </ThemeProvider>
      </QueryClientProvider>
    </ApplicationContextProvider>
  );
};
