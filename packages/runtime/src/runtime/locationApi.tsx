import { browserHistory } from "./history";

export interface EnsembleLocationInterface {
  pathname?: string;
  search?: string;
}

export interface EnsembleLocation {
  get: (key: keyof EnsembleLocationInterface) => string | undefined;
}

export const locationApi = (): EnsembleLocation => {
  return {
    get: (key: keyof EnsembleLocationInterface): string | undefined => {
      return browserHistory.location?.[key];
    },
  };
};
