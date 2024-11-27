import { has, set } from "lodash-es";
import type { Setter } from "jotai";
import { DataFetcher, type WebSocketConnection, type Response } from "../data";
import { error, generateAPIHash, queryClient } from "../shared";
import type {
  EnsembleActionHookResult,
  EnsembleMockResponse,
  EnsembleSocketModel,
} from "../shared";
import { screenDataAtom, type ScreenContextDefinition } from "../state";
import { isUsingMockResponse } from "../appConfig";
import { mockResponse } from "../evaluate/mock";

export const invokeAPI = async (
  apiName: string,
  screenContext: ScreenContextDefinition,
  apiInputs?: { [key: string]: unknown },
  context?: { [key: string]: unknown },
  evaluatedMockResponse?: string | EnsembleMockResponse,
  setter?: Setter,
): Promise<Response | undefined> => {
  const api = screenContext.model?.apis?.find(
    (model) => model.name === apiName,
  );

  const hash = generateAPIHash({
    api: api?.name,
    inputs: apiInputs,
    screen: screenContext.model?.id,
  });

  if (!api) {
    error(`Unable to find API with name ${apiName}`);
    return;
  }

  const update = {};
  if (setter) {
    // Now, because the API exists, set its state to loading
    set(update, api.name, {
      isLoading: true,
      isError: false,
      isSuccess: false,
    });
    setter(screenDataAtom, update);
  }

  // If mock resposne does not exist, fetch the data directly from the API
  const useMockResponse =
    has(api, "mockResponse") && isUsingMockResponse(screenContext.app?.id);

  const response = await queryClient.fetchQuery({
    queryKey: [hash],
    queryFn: () =>
      DataFetcher.fetch(
        api,
        { ...apiInputs, ...context },
        {
          mockResponse: mockResponse(
            evaluatedMockResponse ?? api.mockResponse,
            useMockResponse,
          ),
          useMockResponse,
        },
      ),
    staleTime: api.cacheExpirySeconds ? api.cacheExpirySeconds * 1000 : 0,
  });

  if (setter) {
    set(update, api.name, response);
    setter(screenDataAtom, { ...update });
  }
  return response;
};

export const handleConnectSocket = (
  socketName: string,
  screenContext: ScreenContextDefinition,
  onOpen?: EnsembleActionHookResult,
  onMessage?: EnsembleActionHookResult,
  onClose?: EnsembleActionHookResult,
  setter?: Setter,
): WebSocketConnection | undefined => {
  const socket = findSocket(socketName, screenContext);
  if (!socket) {
    error(`Unable to find socket ${socketName}`);
    return;
  }

  // check the socket is already connected
  const prevSocketConnection = screenContext.data[socket.name] as
    | WebSocketConnection
    | undefined;

  if (prevSocketConnection?.isConnected) {
    return prevSocketConnection;
  }

  const ws = new WebSocket(socket.uri);

  if (onOpen?.callback) {
    ws.onopen = (): unknown => onOpen.callback();
  }

  if (onMessage?.callback) {
    ws.onmessage = (e: MessageEvent): unknown =>
      onMessage.callback({ data: e.data as unknown });
  }

  if (onClose?.callback) {
    ws.onclose = (): unknown => onClose.callback();
  }

  if (setter) {
    const update = {};
    set(update, socket.name, { socket: ws, isConnected: true });
    setter(screenDataAtom, update);
  }

  return { socket: ws, isConnected: true };
};

export const handleMessageSocket = (
  socketName: string,
  message: { [key: string]: unknown },
  screenContext: ScreenContextDefinition,
): void => {
  const socket = findSocket(socketName, screenContext);
  if (!socket) {
    error(`Unable to find socket ${socketName}`);
    return;
  }

  const socketInstance = screenContext.data[socket.name] as WebSocketConnection;
  if (socketInstance.isConnected) {
    socketInstance.socket?.send(JSON.stringify(message));
  }
};

export const handleDisconnectSocket = (
  socketName: string,
  screenContext: ScreenContextDefinition,
  setter?: Setter,
): void => {
  const socket = findSocket(socketName, screenContext);
  if (!socket) {
    error(`Unable to find socket ${socketName}`);
    return;
  }

  const socketInstance = screenContext.data[socket.name] as WebSocketConnection;
  if (socketInstance.isConnected) {
    socketInstance.socket?.close();
    if (setter) {
      const update = {};
      set(update, socket.name, { isConnected: false });
      setter(screenDataAtom, update);
    }
  }
};

const findSocket = (
  socketName: string,
  screenContext: ScreenContextDefinition,
): EnsembleSocketModel | undefined =>
  screenContext.model?.sockets?.find((model) => model.name === socketName);
