import { useEffect, useMemo, useState } from "react";
import type {
  ApplicationDTO,
  EnsembleAppModel,
  ApplicationLoader,
} from "@ensembleui/react-framework";
import {
  ApplicationContextProvider,
  EnsembleParser,
  useDeviceData,
} from "@ensembleui/react-framework";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { injectStyle } from "react-toastify/dist/inject-style";
import { ThemeProvider } from "./ThemeProvider";
import { EnsembleEntry } from "./runtime/entry";
import { EnsembleScreen } from "./runtime/screen";
import { ErrorPage } from "./runtime/error";
// Register built in widgets;
import "./widgets";
import { WidgetRegistry } from "./registry";
import { createCustomWidget } from "./runtime/customWidget";
import { debounce } from "lodash-es";

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
  const { setData: updateDeviceData } = useDeviceData();

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
                  <EnsembleEntry
                    entry={app.home}
                    screen={app.screens.find(
                      (screen) => Boolean(screenId) && screen.id === screenId,
                    )}
                  />
                ),
                errorElement: <ErrorPage />,
                children: app.screens.map((screen) => {
                  const screenPath = screen.name.toLowerCase();
                  return {
                    path: screen.path ?? `${screenPath}`,
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

  const handleResize = (): void => {
    updateDeviceData({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  const debouncedUpdateDeviceData = useMemo(
    () => debounce(handleResize, 500),
    [],
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver(debouncedUpdateDeviceData);
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      debouncedUpdateDeviceData.cancel(); // Cancel any pending debounced calls on cleanup
    };
  }, [debouncedUpdateDeviceData]);

  if (!app || !router) {
    return null;
  }

  return (
    <ApplicationContextProvider
      app={app}
      environmentOverrides={environmentOverrides}
    >
      <ThemeProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ThemeProvider>
    </ApplicationContextProvider>
  );
};
