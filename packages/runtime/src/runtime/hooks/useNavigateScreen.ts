import type { NavigateScreenAction } from "@ensembleui/react-framework";
import { isNil, isString, merge, cloneDeep } from "lodash-es";
import { useNavigate } from "react-router-dom";
import {
  useCommandCallback,
  evaluate,
  useScreenModel,
  useApplicationContext,
  evaluateDeep,
} from "@ensembleui/react-framework";
import type { EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateScreen: EnsembleActionHook<NavigateScreenAction> = (
  action,
) => {
  const navigate = useNavigate();
  const screenModel = useScreenModel();
  const appContext = useApplicationContext();

  const navigateCommand = useCommandCallback(
    (evalContext, ...args) => {
      if (!action) return;

      const context = merge({}, evalContext, args[0]);

      const screenName = isString(action) ? action : action.name;
      const evaluatedName = evaluate<string>(
        { model: screenModel },
        screenName,
        context,
      );

      const matchingScreen = appContext?.application?.screens.find(
        (s) => s.name?.toLowerCase() === evaluatedName.toLowerCase(),
      );

      if (!matchingScreen?.name) return;

      const evaluatedInputs =
        !isString(action) && !isNil(action.inputs)
          ? evaluateDeep(cloneDeep(action.inputs), screenModel, context)
          : undefined;

      navigate(`/${matchingScreen.name.toLowerCase()}`, {
        state: evaluatedInputs,
      });
    },
    { navigate },
    [action, screenModel, appContext],
  );

  return { callback: navigateCommand };
};
