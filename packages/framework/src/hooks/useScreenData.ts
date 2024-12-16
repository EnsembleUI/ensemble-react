import { useAtom, useAtomValue } from "jotai";
import { clone } from "lodash-es";
import { useCallback, useMemo } from "react";
import isEqual from "react-fast-compare";
import type { Response, WebSocketConnection } from "../data";
import type {
  EnsembleAPIModel,
  EnsembleMockResponse,
  EnsembleSocketModel,
} from "../shared";
import type { ScreenContextData } from "../state";
import { screenApiAtom, screenSocketAtom, screenDataAtom } from "../state";
import { useEvaluate } from "./useEvaluate";

export const useScreenData = (): {
  apis?: EnsembleAPIModel[];
  sockets?: EnsembleSocketModel[];
  data: ScreenContextData;
  setData: (name: string, response: Response | WebSocketConnection) => void;
  setApi: (index: number, apiData: EnsembleAPIModel) => void;
  mockResponses: {
    [apiName: string]: EnsembleMockResponse | string | undefined;
  };
} => {
  const sockets = useAtomValue(screenSocketAtom);
  const [data, setDataAtom] = useAtom(screenDataAtom);
  const [apis, setApiAtom] = useAtom(screenApiAtom);

  const apiMockResponses = useMemo(() => {
    return apis?.reduce(
      (
        acc: { [key: string]: EnsembleMockResponse | string | undefined },
        api,
      ) => {
        acc[api.name] = api.mockResponse;
        return acc;
      },
      {},
    );
  }, [apis]);

  const mockResponses = useEvaluate(apiMockResponses);

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

  const setApi = useCallback(
    (index: number, apiData: EnsembleAPIModel) => {
      if (isEqual(apis?.[index], apiData) || !apis) {
        return;
      }
      apis[index] = apiData;
      setApiAtom(clone(apis));
    },
    [apis, setApiAtom],
  );

  return {
    apis,
    sockets,
    data,
    setData,
    setApi,
    mockResponses,
  };
};
