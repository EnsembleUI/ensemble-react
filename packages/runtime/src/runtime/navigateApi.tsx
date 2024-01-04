import type {
  NavigateScreenAction,
  ScreenContextDefinition,
} from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import { browserHistory } from "./history";

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
