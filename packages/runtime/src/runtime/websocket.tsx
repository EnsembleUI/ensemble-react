import { type useScreenData } from "@ensembleui/react-framework";

export const handleConnectSocket = (
  screenData: ReturnType<typeof useScreenData>,
  name: string,
): WebSocket | undefined => {
  const socket = screenData.sockets?.find((model) => model.name === name);
  if (!socket) {
    return;
  }

  const ws = new WebSocket(socket.uri);
  screenData.setData(socket.name, ws);

  return ws;
};

export const handleMessageSocket = (
  screenData: ReturnType<typeof useScreenData>,
  name: string,
  message?: { [key: string]: unknown },
) => {
  const socket = screenData.sockets?.find((model) => model.name === name);
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
  name: string,
): void => {
  const socket = screenData.sockets?.find((model) => model.name === name);
  if (!socket) {
    return;
  }

  const socketInstance = screenData.data[socket.name] as WebSocket;
  if (socketInstance) {
    socketInstance.close();
  }

  screenData.setData(socket.name, {
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  return;
};
