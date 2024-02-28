import {
  type ScreenContextDefinition,
  type NavigateScreenAction,
} from "@ensembleui/react-framework";
import { cloneDeep, isObject, isString } from "lodash-es";
import type { NavigateFunction } from "react-router-dom";

export const navigateApi = (
  action: NavigateScreenAction,
  screenContext: ScreenContextDefinition,
  navigate: NavigateFunction,
): void => {
  const hasOptions = !isString(action);
  const screenName = hasOptions ? action.name : action;

  // find the matching screen
  const matchingScreen = screenContext.app?.screens.find(
    (s) => s.name.toLowerCase() === screenName.toLowerCase(),
  );

  if (!matchingScreen) {
    return;
  }

  // set additional inputs
  const inputs =
    !isString(action) && action.inputs ? cloneDeep(action.inputs) : {};

  navigate(`/${matchingScreen.name.toLowerCase()}`, { state: inputs });
};

export const navigateUrl = (
  url: string,
  navigate: NavigateFunction,
  inputs?: Record<string, unknown>,
): void => {
  // set additional inputs
  const urlInputs = inputs && isObject(inputs) ? cloneDeep(inputs) : {};

  navigate(url, { state: urlInputs });
};

export const navigateBack = (navigate: NavigateFunction): void => {
  navigate(-1);
};
