import {
  ApplicationContextProvider,
  ApplicationLoader,
  EnsembleParser,
  ScreenContextProvider,
} from "framework";
import { EnsembleRuntime } from "./runtime";
// Register built in widgets;
import "./widgets";

export interface EnsembleAppProps {
  appId: string;
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({ appId }) => {
  try {
    const application = ApplicationLoader.load(appId);
    const screen = EnsembleParser.parseScreen(
      "Home",
      application.screens[0].content,
    );
    return (
      <ApplicationContextProvider app={application}>
        <ScreenContextProvider screen={screen}>
          {EnsembleRuntime.execute(screen)}
        </ScreenContextProvider>
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
