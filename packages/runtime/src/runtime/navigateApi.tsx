import {
  evaluate,
  findExpressions,
  type ScreenContextDefinition,
  type EnsembleStorage,
} from "@ensembleui/react-framework";
import { cloneDeep, isString, set } from "lodash-es";
import type { NavigateFunction } from "react-router-dom";

export const navigateApi = (
  targetScreen: string,
  data: unknown,
  screenContext: ScreenContextDefinition,
  storage: EnsembleStorage,
  navigate: NavigateFunction,
  customScope?: Record<string, unknown>,
): void => {
  // find the matching screen
  const matchingScreen = screenContext?.app?.screens.find(
    (s) => s.name.toLowerCase() === targetScreen.toLowerCase(),
  );

  if (!matchingScreen) {
    return;
  }

  // set additional inputs
  const inputs = isString(targetScreen) && data ? cloneDeep(data) : {};

  const expressionMap: string[][] = [];
  findExpressions(inputs, [], expressionMap);
  expressionMap.forEach(([path, value]) => {
    const result = evaluate(screenContext, value, {
      ensemble: { storage },
      ...customScope,
    });
    set(inputs, path, result);
  });

  navigate(`/${matchingScreen.name.toLowerCase()}`, { state: inputs });
};
