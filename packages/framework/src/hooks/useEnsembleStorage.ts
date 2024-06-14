import { useAtom } from "jotai";
import { clone } from "lodash-es";
import { useMemo } from "react";
import { atomWithSessionStorage } from "../state";

export interface EnsembleStorage {
  [key: string]: unknown;
}

export const storageAtom = atomWithSessionStorage<EnsembleStorage>(
  "ensemble.storage",
  {},
);

interface EnsembleStorageBuffer {
  set: (key: string, value: unknown) => void;
}

export const useEnsembleStorage = (): EnsembleStorage &
  EnsembleStorageBuffer => {
  const [storage, setStorage] = useAtom(storageAtom);

  const storageBuffer = useMemo<EnsembleStorageBuffer>(
    () => ({
      set: (key: string, value: unknown): void => {
        storage[key] = value;
        setStorage(clone(storage));
        window.dispatchEvent(
          new StorageEvent("storage", { key: "ensemble.storage" }),
        );
      },
      get: (key: string): unknown => {
        return storage[key];
      },
    }),
    [setStorage, storage],
  );

  return { ...storageBuffer, ...storage };
};
