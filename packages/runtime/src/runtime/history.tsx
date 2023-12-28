import { type NavigateFunction, type Location } from "react-router-dom";

export interface BrowserHistoryDefinition {
  navigate: NavigateFunction | unknown;
  location: Location | unknown;
}

export const browserHistory: BrowserHistoryDefinition = {
  navigate: null,
  location: null,
};
