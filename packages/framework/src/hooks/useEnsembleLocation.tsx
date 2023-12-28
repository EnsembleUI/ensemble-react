import { useMemo } from "react";
import { useAtom } from "jotai";
import { merge } from "lodash-es";
import { locationAtom } from "../state";

export interface EnsembleLocationInterface {
  pathname?: string;
  searchParams?: URLSearchParams;
}

export interface EnsembleLocation {
  set: (data: EnsembleLocationInterface) => void;
  get: (
    key: keyof EnsembleLocationInterface,
  ) => string | URLSearchParams | undefined;
}

export interface EnsembleLocationSetDefinition {
  key: keyof EnsembleLocationInterface;
  data: (string & URLSearchParams) | undefined;
}

export const useEnsembleLocation = (): EnsembleLocation => {
  const [location, setLocation] = useAtom(locationAtom);

  const locationBuffer = useMemo<EnsembleLocationInterface>(() => ({}), []);

  useMemo(() => {
    merge(locationBuffer, location);
  }, [locationBuffer, location]);

  const locationApi = useMemo(
    () => createLocationApi(locationBuffer, setLocation),
    [setLocation, locationBuffer],
  );

  return locationApi;
};

export const createLocationApi = (
  location?: EnsembleLocationInterface,
  setLocation?: (data: EnsembleLocationInterface) => void,
): EnsembleLocation => {
  return {
    set: (data: EnsembleLocationInterface): void => {
      if (location) {
        const newlocation = { ...location, ...data };
        setLocation?.(newlocation);
      }
    },
    get: (
      key: keyof EnsembleLocationInterface,
    ): string | URLSearchParams | undefined => {
      return location?.[key];
    },
  };
};
