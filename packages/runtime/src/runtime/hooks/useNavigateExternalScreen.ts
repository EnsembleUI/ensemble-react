import { isString, cloneDeep, merge } from "lodash-es";
import {
  evaluateDeep,
  useCommandCallback,
  useScreenModel,
  type NavigateExternalScreen,
} from "@ensembleui/react-framework";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line import/no-cycle
import { openExternalScreen } from "../navigation";
import { type EnsembleActionHook } from "./useEnsembleAction";

export const useNavigateExternalScreen: EnsembleActionHook<
  NavigateExternalScreen
> = (action) => {
  const navigate = useNavigate();
  const screenModel = useScreenModel();

  const callback = useCommandCallback(
    (evalContext, ...args) => {
      if (!action) return;

      const context = merge({}, evalContext, args[0]);

      const evaluatedInputs = evaluateDeep(
        isString(action) ? { url: action } : cloneDeep({ ...action }),
        screenModel,
        context,
      );

      if (!evaluatedInputs.url) return;

      // Type assertion is safe here because we've verified url exists
      return openExternalScreen(
        evaluatedInputs as unknown as NavigateExternalScreen,
      );
    },
    { navigate },
    [action, screenModel],
  );

  return { callback };
};
