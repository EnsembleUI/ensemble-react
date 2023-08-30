import { ApplicationLoader, EnsembleParser } from "framework";
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
    return <>{EnsembleRuntime.execute(screen)}</>;
  } catch (e) {
    return (
      <>
        <div>Something went wrong:</div>
        <div>{(e as Error).message}</div>
      </>
    );
  }
};
