import type { NavigateScreenAction } from "@ensembleui/react-framework";
import { isNil, isString, merge, cloneDeep } from "lodash-es";
import { useNavigate } from "react-router-dom";
import {
  useCommandCallback,
  useScreenModel,
  useApplicationContext,
  evaluateDeep,
} from "@ensembleui/react-framework";
import type { EnsembleActionHook } from "./useEnsembleAction";

type EvaluatedData = {
  screenName: string;
  inputs?: { [key: string]: unknown };
};

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

      const { screenName, inputs } = evaluateDeep(
        {
          screenName: isString(action) ? action : action.name,
          inputs:
            !isString(action) && !isNil(action.inputs)
              ? cloneDeep(action.inputs)
              : undefined,
        },
        screenModel,
        context,
      ) as EvaluatedData;

      const matchingScreen = appContext?.application?.screens.find(
        (s) => s.name?.toLowerCase() === screenName.toLowerCase(),
      );

      if (!matchingScreen?.name) return;

      navigate(`/${matchingScreen.name.toLowerCase()}`, {
        state: inputs,
      });
    },
    { navigate },
    [action, screenModel, appContext],
  );

  return { callback: navigateCommand };
};
