import { type useScreenData } from "@ensembleui/react-framework";

export const handleConnectSocket = (
  screenData: ReturnType<typeof useScreenData>,
  socketName: string,
): WebSocket | undefined => {
  const socket = screenData.sockets?.find((model) => model.name === socketName);
  if (!socket) {
    return;
  }

  const ws = new WebSocket(socket.uri);
  screenData.setData(socket.name, ws);

  return ws;
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

  const socketInstance = screenData.data[socket.name] as WebSocket;
  if (socketInstance) {
    socketInstance.send(JSON.stringify(message));
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

  const socketInstance = screenData.data[socket.name] as WebSocket;
  if (socketInstance) {
    socketInstance.close();
  }
};
