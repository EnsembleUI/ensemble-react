import type { EnsembleAPIModel } from "@ensembleui/react-framework";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "../hooks";
import { isEmpty } from "lodash-es";

export const processApiDefinitions = (
  apis: EnsembleAPIModel[] = [],
): EnsembleAPIModel[] => {
  if (isEmpty(apis)) {
    return [];
  }

  return apis.map((api) => {
    const onResponseAction = useEnsembleAction(api.onResponse);
    const onErrorAction = useEnsembleAction(api.onError);

    return {
      ...api,
      onResponseAction,
      onErrorAction,
    };
  });
};
