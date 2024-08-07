import {
  type useScreenData,
  type WebSocketConnection,
  type EnsembleActionHookResult,
} from "@ensembleui/react-framework";

export const handleConnectSocket = (
  screenData: ReturnType<typeof useScreenData>,
  socketName: string,
  onOpen?: EnsembleActionHookResult,
  onMessage?: EnsembleActionHookResult,
  onClose?: EnsembleActionHookResult,
): WebSocketConnection | undefined => {
  const socket = screenData.sockets?.find((model) => model.name === socketName);
  if (!socket) {
    return;
  }

  // check the socket is already connected
  const prevSocketConnection = screenData.data[
    socket.name
  ] as WebSocketConnection;

  if (prevSocketConnection && prevSocketConnection.isConnected) {
    return prevSocketConnection;
  }

  const ws = new WebSocket(socket.uri);

  if (onOpen?.callback) {
    ws.onopen = () => onOpen?.callback();
  }

  if (onMessage?.callback) {
    ws.onmessage = (e: MessageEvent) =>
      onMessage?.callback({ data: e.data as unknown });
  }

  if (onClose?.callback) {
    ws.onclose = () => onClose?.callback();
  }

  screenData.setData(socket.name, { socket: ws, isConnected: true });

  return { socket: ws, isConnected: true };
};

export const handleMessageSocket = (
  screenData: ReturnType<typeof useScreenData>,
  socketName: string,
  message?: { [key: string]: unknown },
): void => {
  const socket = screenData.sockets?.find((model) => model.name === socketName);
  if (!socket) {
    return;
  }

  const socketInstance = screenData.data[socket.name] as WebSocketConnection;
  if (socketInstance.isConnected) {
    socketInstance.socket?.send(JSON.stringify(message));
  }
};

export const handleDisconnectSocket = (
  screenData: ReturnType<typeof useScreenData>,
  socketName: string,
): void => {
  const socket = screenData.sockets?.find((model) => model.name === socketName);
  if (!socket) {
    return;
  }

  const socketInstance = screenData.data[socket.name] as WebSocketConnection;
  if (socketInstance.isConnected) {
    socketInstance.socket?.close();
    screenData.setData(socket.name, { isConnected: false });
  }
};
