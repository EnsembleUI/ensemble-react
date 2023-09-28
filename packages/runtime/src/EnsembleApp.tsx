import { useMemo } from "react";
import type { ApplicationDTO } from "framework";
import {
  ApplicationContextProvider,
  ApplicationLoader,
  EnsembleParser,
} from "framework";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./ThemeProvider";
// Register built in widgets;
import "./widgets";
import { EnsembleEntry } from "./runtime/entry";
import { EnsembleScreen } from "./runtime/screen";

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
      </ThemeProvider>
    </ApplicationContextProvider>
  );
};
