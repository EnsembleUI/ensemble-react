import { useMemo } from "react";
import type { ApplicationDTO } from "framework";
import {
  ApplicationContextProvider,
  ApplicationLoader,
  EnsembleParser,
} from "framework";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { injectStyle } from "react-toastify/dist/inject-style";
import { ThemeProvider } from "./ThemeProvider";
import { EnsembleEntry } from "./runtime/entry";
import { EnsembleScreen } from "./runtime/screen";
import { ErrorPage } from "./runtime/error";
// Register built in widgets;
import "./widgets";

injectStyle();
export interface EnsembleAppProps {
  appId: string;
  application?: ApplicationDTO;
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  appId,
  application,
}) => {
  const resolvedApp = application ?? ApplicationLoader.load(appId);
  const app = EnsembleParser.parseApplication(resolvedApp);
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <EnsembleEntry entry={app.home} />,
          errorElement: <ErrorPage />,
          children: app.screens.map((screen) => {
            return {
              path: `${screen.name.toLowerCase()}`,
              element: <EnsembleScreen screen={screen} />,
            };
          }),
        },
      ]),
    [app],
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
