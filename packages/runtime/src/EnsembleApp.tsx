import type { Application } from "framework";
import {
  ApplicationContextProvider,
  ApplicationLoader,
  
  ScreenContextProvider,
} from "framework";
import { EnsembleParserVG } from "framework";
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
    const screen = EnsembleParserVG.parseScreen(
      "Home",
      resolvedApp.screens[0].content,
    );
    return (
      <ApplicationContextProvider app={resolvedApp}>
        <ThemeProvider>
          <ScreenContextProvider screen={screen}>
            {EnsembleRuntime.execute(screen)}
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
