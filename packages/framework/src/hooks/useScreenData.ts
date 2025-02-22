import { useAtom, useAtomValue } from "jotai";
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
  setData: (
    name: string,
    response: Partial<Response> | WebSocketConnection,
  ) => void;
  mockResponses: {
    [apiName: string]: EnsembleMockResponse | string | undefined;
  };
} => {
  const apis = useAtomValue(screenApiAtom);
  const sockets = useAtomValue(screenSocketAtom);
  const [data, setDataAtom] = useAtom(screenDataAtom);

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

  return {
    apis,
    sockets,
    data,
    setData,
    mockResponses,
  };
};
