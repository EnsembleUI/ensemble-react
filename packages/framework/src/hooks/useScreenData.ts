import { useAtom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import isEqual from "react-fast-compare";
import { clone } from "lodash-es";
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
  setData: (
    name: string,
    response: Partial<Response> | WebSocketConnection,
  ) => void;
  setApi: (apiData: EnsembleAPIModel) => void;
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
    (name: string, response: Partial<Response> | WebSocketConnection) => {
      if (isEqual(data[name], response)) {
        return;
      }
      data[name] = response;
      setDataAtom({ [name]: response });
    },
    [data, setDataAtom],
  );

  const setApi = useCallback(
    (apiData: EnsembleAPIModel) => {
      const index = apis?.findIndex((api) => api.name === apiData.name);
      if (index === undefined || isEqual(apis?.[index], apiData) || !apis) {
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
