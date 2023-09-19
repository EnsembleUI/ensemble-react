import type { Application } from "framework";
import {
  ApplicationContextProvider,
  ApplicationLoader,
  EnsembleParser,
  ScreenContextProvider,
} from "framework";
import { EnsembleRuntime } from "./runtime";
import { ThemeProvider } from "./ThemeProvider";
// Register built in widgets;
import "./widgets";

export interface EnsembleAppProps {
  appId: string;
  application?: Application;
  page: string;
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  page,
  appId,
  application,
}) => {
  try {
    const resolvedApp = application ?? ApplicationLoader.load(appId);
    const screen = EnsembleParser.parseScreen(
      page,
      resolvedApp.screens[0].content,
    );
    return (
      <ApplicationContextProvider app={resolvedApp}>
        <ThemeProvider>
          <ScreenContextProvider screen={screen}>
            <EnsembleRuntime.Screen screen={screen} />
          </ScreenContextProvider>
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
