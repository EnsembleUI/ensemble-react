import { useMemo } from "react";
import type { ApplicationDTO } from "@ensembleui/react-framework";
import {
  ApplicationContextProvider,
  ApplicationLoader,
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
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  appId,
  application,
  path,
}) => {
  // BUG: runs twice https://github.com/facebook/react/issues/24935
  const app = useMemo(() => {
    const resolvedApp = application ?? ApplicationLoader.load(appId);
    const parsedApp = EnsembleParser.parseApplication(resolvedApp);
    parsedApp.customWidgets.forEach((customWidget) => {
      WidgetRegistry.register(
        customWidget.name,
        createCustomWidget(customWidget),
      );
    });
    return parsedApp;
  }, [appId, application]);

  const router = useMemo(
    () =>
      createBrowserRouter(
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
                    element: <EnsembleScreen key={screenId} screen={screen} />,
                  };
                }),
              },
            ],
          },
        ],
        { basename: path },
      ),
    [app.home, app.screens, path],
  );

  return (
    <ApplicationContextProvider app={app}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ThemeProvider>
    </ApplicationContextProvider>
  );
};
