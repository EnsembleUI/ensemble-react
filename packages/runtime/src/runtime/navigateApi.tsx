import type {
  NavigateScreenAction,
  CustomScope,
  ScreenContextDefinition,
  EnsembleStorage,
} from "@ensembleui/react-framework";
import { findExpressions, evaluate } from "@ensembleui/react-framework";
import { isString, cloneDeep, set } from "lodash-es";
import type { NavigateFunction, Location } from "react-router-dom";

export interface BrowserHistoryDefinition {
  navigate: NavigateFunction | undefined;
  location: Location | undefined;
}

export const browserHistory: BrowserHistoryDefinition = {
  navigate: undefined,
  location: undefined,
};

export const navigateApi = (
  targetScreen: NavigateScreenAction,
  screenContext: ScreenContextDefinition,
): void => {
  const hasOptions = !isString(targetScreen);
  const screenName = hasOptions ? targetScreen.name : targetScreen;

  // find the matching screen
  const matchingScreen = screenContext?.app?.screens.find(
    (s) => s.name.toLowerCase() === screenName.toLowerCase(),
  );

  if (!matchingScreen) {
    return;
  }

  // navigate to target screen
  if (!browserHistory.navigate) {
    return;
  }

  browserHistory.navigate(`/${matchingScreen.name.toLowerCase()}`);
};
