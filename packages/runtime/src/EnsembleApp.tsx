import type { Application } from "framework";
import {
  ApplicationContextProvider,
  ApplicationLoader,
  EnsembleParser,
} from "framework";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { EnsembleRuntime } from "./runtime";
import { ThemeProvider } from "./ThemeProvider";
// Register built in widgets;
import "./widgets";

export interface EnsembleAppProps {
  appId: string;
  application?: Application;
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  appId,
  application,
}) => {
  try {
    const resolvedApp = application ?? ApplicationLoader.load(appId);
    const routes = resolvedApp.screens.map((rawScreen) => {
      const screen = EnsembleParser.parseScreen(
        rawScreen.name,
        rawScreen.content,
      );
      return {
        path: `/${screen.name}` === "home" ? "" : screen.name.toLowerCase(),
        element: <EnsembleRuntime.Screen screen={screen} />,
      };
    });
    const router = createBrowserRouter(routes);
    return (
      <ApplicationContextProvider app={resolvedApp}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ApplicationContextProvider>
    );
  } catch (e) {
    return (
      <>
        <div>Something went wrong:</div>
        <div>{(e as Error).message}</div>
      </>
    );
  }
};
