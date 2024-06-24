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
}

export const useEnsembleStorage = (): EnsembleStorage &
  EnsembleStorageBuffer => {
  const [storage, setStorage] = useAtom(screenStorageAtom);
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
      delete: (key: string): unknown => {
        const oldVal = storage[key];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete storage[key];
        setStorage(clone(storage));

        return oldVal;
      },
    }),
    [setStorage, storage],
  );

  return { ...storageBuffer, ...storage };
};
