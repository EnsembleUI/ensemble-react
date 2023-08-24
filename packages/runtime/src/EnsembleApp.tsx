import { ApplicationLoader, EnsembleParser } from "framework";
import { EnsembleRuntime } from "./runtime";

export interface EnsembleAppProps {
  appId: string;
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({ appId }) => {
  try {
    const application = ApplicationLoader.load(appId);
    const screen = EnsembleParser.parseScreen(application.screens[0].content);
    return <>{EnsembleRuntime.execute(screen)}</>;
  } catch (e) {
    return <div>{appId}</div>;
  }
};
