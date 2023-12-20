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
import { GoogleOAuthProvider } from "@react-oauth/google";
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
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  appId,
  application,
}) => {
  // TODO: need to move this inside env
  const oAuthClientId =
    "726646987043-9i1it0ll0neojkf7f9abkagbe66kqe4a.apps.googleusercontent.com";

  // BUG: runs twice https://github.com/facebook/react/issues/24935
  const app = useMemo(() => {
    const resolvedApp = application ?? ApplicationLoader.load(appId);
    const parsedApp = EnsembleParser.parseApplication(resolvedApp);
    parsedApp.customWidgets.forEach((customWidget) => {
      WidgetRegistry.register(
        customWidget.name,
        createCustomWidget(customWidget)
      );
    });
    return parsedApp;
  }, [appId, application]);

  const router = useMemo(
    () =>
      createBrowserRouter([
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
      ]),
    [app]
  );

  return (
    <ApplicationContextProvider app={app}>
      <ThemeProvider>
        {oAuthClientId ? (
          <GoogleOAuthProvider clientId={oAuthClientId}>
            <RouterProvider router={router} />
            <ToastContainer />
          </GoogleOAuthProvider>
        ) : (
          <>
            <RouterProvider router={router} />
            <ToastContainer />
          </>
        )}
      </ThemeProvider>
    </ApplicationContextProvider>
  );
};
