import { useAtom } from "jotai";
import { clone } from "lodash-es";
import { useMemo } from "react";
import { atomWithSessionStorage } from "../state";

export interface EnsembleStorage {
  [key: string]: unknown;
}

export const screenStorageAtom = atomWithSessionStorage<EnsembleStorage>(
  "ensemble.storage",
  {},
);

interface EnsembleStorageBuffer {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

export const useEnsembleStorage = (): EnsembleStorage &
  EnsembleStorageBuffer => {
  const [storage, setStorage] = useAtom(screenStorageAtom);
  const storageBuffer = useMemo<EnsembleStorageBuffer>(
    () => createStorageApi(storage, setStorage),
    [setStorage, storage],
  );

  return { ...storageBuffer, ...storage };
};

export const createStorageApi = (
  storage: { [key: string]: unknown },
  setStorage?: (storage: { [key: string]: unknown }) => void,
): EnsembleStorageBuffer => {
  return {
    set: (key: string, value: unknown): void => {
      storage[key] = value;
      setStorage?.(clone(storage));
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ensemble.storage" }),
      );
    },
    get: (key: string): unknown => {
      return storage[key];
    },
    delete: (key: string): unknown => {
      const oldVal = storage[key];
      delete storage?.[key];
      setStorage?.(clone(storage));
      return oldVal;
    },
  };
};
