import type { Location } from "react-router-dom";

export interface EnsembleLocationInterface {
  pathname?: string;
  search?: string;
}

export interface EnsembleLocation {
  get: (key: keyof EnsembleLocationInterface) => string | undefined;
}

export const locationApi = (location: Location): EnsembleLocation => {
  return {
    get: (key: keyof EnsembleLocationInterface): string | undefined => {
      return location[key];
    },
  };
};
