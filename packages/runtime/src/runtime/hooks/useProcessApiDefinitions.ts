import type { EnsembleScreenModel } from "@ensembleui/react-framework";
import { isEmpty } from "lodash-es";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./useEnsembleAction";

export const useProcessApiDefinitions = (
  screen: EnsembleScreenModel,
): boolean => {
  if (isEmpty(screen.apis)) {
    return true;
  }

  screen.apis = screen?.apis?.map((api) => {
    /* eslint-disable react-hooks/rules-of-hooks */
    const onResponseAction = useEnsembleAction(api.onResponse);
    const onErrorAction = useEnsembleAction(api.onError);
    /* eslint-enable react-hooks/rules-of-hooks */

    return {
      ...api,
      onResponseAction,
      onErrorAction,
    };
  });

  return true;
};
