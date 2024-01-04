import type { NavigateFunction, Location } from "react-router-dom";

export interface BrowserHistoryDefinition {
  navigate: NavigateFunction | undefined;
  location: Location | undefined;
}

export const browserHistory: BrowserHistoryDefinition = {
  navigate: undefined,
  location: undefined,
};
