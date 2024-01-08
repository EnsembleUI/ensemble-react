import type {
  NavigateScreenAction,
  ScreenContextDefinition,
} from "@ensembleui/react-framework";
import { isString } from "lodash-es";
import type { NavigateFunction } from "react-router-dom";

export const navigateApi = (
  targetScreen: NavigateScreenAction,
  screenContext: ScreenContextDefinition,
  navigate: NavigateFunction,
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

  navigate(`/${matchingScreen.name.toLowerCase()}`);
};
