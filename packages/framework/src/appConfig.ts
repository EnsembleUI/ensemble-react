const appConfigTable: { [key: string]: AppConfig } = {};

export interface AppConfig {
  useMockResponse: boolean;
}

export const isUsingMockResponse = (appId: string | undefined): boolean => {
  if (!appId || !(appId in appConfigTable)) return false;
  return appConfigTable[appId].useMockResponse;
};

export const setUseMockResponse = (
  appId: string | undefined,
  value: boolean,
): void => {
  if (typeof appId === "undefined") return;
  appConfigTable[appId] = { useMockResponse: value };
};