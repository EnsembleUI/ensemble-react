const appConfigTable: { [key: string]: AppConfig } = {};

interface AppConfig {
  useMockResponse: boolean;
}

export const useMockResponse = (appId: string | undefined) => {
  if (typeof appId === "undefined" || !(appId in appConfigTable)) return false;
  return appConfigTable[appId].useMockResponse;
};

export const setUseMockResponse = (
  appId: string | undefined,
  value: boolean,
) => {
  if (typeof appId === "undefined") return;
  appConfigTable[appId] = { useMockResponse: value };
};
