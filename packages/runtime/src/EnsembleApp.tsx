import { useEffect, useMemo, useState } from "react";
import type {
  ApplicationDTO,
  EnsembleAppModel,
  ApplicationLoader,
} from "@ensembleui/react-framework";
import {
  ApplicationContextProvider,
  EnsembleParser,
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
import { ModalWrapper } from "./runtime/modal";
import { WidgetRegistry } from "./registry";
import { createCustomWidget } from "./runtime/customWidget";

injectStyle();

export interface EnsembleAppProps {
  appId: string;
  application?: ApplicationDTO;
  path?: string;
  loader?: ApplicationLoader;
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  appId,
  application,
  path,
  loader,
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
                element: <ModalWrapper />,
                children: [
                  {
                    path: "/",
                    element: <EnsembleEntry entry={app.home} />,
                    errorElement: <ErrorPage />,
                    children: app.screens.map((screen) => {
                      const screenId = screen.name.toLowerCase();
                      return {
                        path: `${screenId}`,
                        element: (
                          <EnsembleScreen key={screenId} screen={screen} />
                        ),
                      };
                    }),
                  },
                ],
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
    <ApplicationContextProvider app={app}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ThemeProvider>
    </ApplicationContextProvider>
  );
};
