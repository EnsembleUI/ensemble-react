import type {
  WebSocketConnection,
  EnsembleActionHookResult,
  ScreenContextData,
  EnsembleSocketModel,
} from "@ensembleui/react-framework";

export const handleConnectSocket = (
  screenData: ScreenContextData,
  screenDataSetter: (name: string, response: WebSocketConnection) => void,
  socket: EnsembleSocketModel,
  onOpen?: EnsembleActionHookResult,
  onMessage?: EnsembleActionHookResult,
  onClose?: EnsembleActionHookResult,
): WebSocketConnection | undefined => {
  // check the socket is already connected
  const prevSocketConnection = screenData[socket.name] as
    | WebSocketConnection
    | undefined;

  if (prevSocketConnection?.isConnected) {
    return prevSocketConnection;
  }

  const ws = new WebSocket(socket.uri);

  if (onOpen?.callback) {
    ws.onopen = () => onOpen.callback();
  }

  if (onMessage?.callback) {
    ws.onmessage = (e: MessageEvent) =>
      onMessage.callback({ data: e.data as unknown });
  }

  if (onClose?.callback) {
    ws.onclose = () => onClose.callback();
  }

  screenDataSetter(socket.name, { socket: ws, isConnected: true });

  return { socket: ws, isConnected: true };
};

export const handleMessageSocket = (
  screenData: ScreenContextData,
  socket: EnsembleSocketModel,
  message?: { [key: string]: unknown },
): void => {
  const socketInstance = screenData[socket.name] as WebSocketConnection;
  if (socketInstance.isConnected) {
    socketInstance.socket?.send(JSON.stringify(message));
  }
};

export const handleDisconnectSocket = (
  screenData: ScreenContextData,
  socket: EnsembleSocketModel,
  screenDataSetter: (name: string, response: WebSocketConnection) => void,
): void => {
  const socketInstance = screenData[socket.name] as WebSocketConnection;
  if (socketInstance.isConnected) {
    socketInstance.socket?.close();
    screenDataSetter(socket.name, { isConnected: false });
  }
};
