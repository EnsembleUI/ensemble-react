import { useAtom, useAtomValue } from "jotai";
import { clone } from "lodash-es";
import { useCallback } from "react";
import isEqual from "react-fast-compare";
import type { Response, WebSocketConnection } from "../data";
import type {
  EnsembleAPIModel,
  EnsembleMockResponse,
  EnsembleSocketModel,
} from "../shared";
import type { ScreenContextDefinition, ScreenContextActions } from "../state";
import { screenApiAtom, screenSocketAtom, screenDataAtom } from "../state";
import { useEvaluate } from "./useEvaluate";

export const useScreenData = (): { apis?: EnsembleAPIModel[] } & {
  sockets?: EnsembleSocketModel[];
} & Pick<ScreenContextDefinition, "data"> &
  Pick<ScreenContextActions, "setData"> & {
    mockResponses: { [key: string]: EnsembleMockResponse | string | undefined };
  } => {
  const apis = useAtomValue(screenApiAtom);
  const sockets = useAtomValue(screenSocketAtom);
  const [data, setDataAtom] = useAtom(screenDataAtom);

  const mockResponses = useEvaluate(
    apis
      ? apis.reduce(
          (
            acc: { [key: string]: EnsembleMockResponse | string | undefined },
            api,
          ) => {
            acc[api.name] = api.mockResponse;
            return acc;
          },
          {},
        )
      : {},
  );

  const setData = useCallback(
    (name: string, response: Response | WebSocketConnection) => {
      if (isEqual(data[name], response)) {
        return;
      }
      data[name] = response;
      setDataAtom(clone(data));
    },
    [data, setDataAtom],
  );

  return {
    apis,
    sockets,
    data,
    setData,
    mockResponses,
  };
};
