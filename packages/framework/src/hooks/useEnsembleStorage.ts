import { useAtom } from "jotai";
import { createJSONStorage, atomWithStorage } from "jotai/utils";
import { clone, merge } from "lodash-es";
import { useMemo } from "react";

export interface EnsembleStorage {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

const backingStorage = createJSONStorage<{ [key: string]: unknown }>(
  () => sessionStorage,
);

export const screenStorageAtom = atomWithStorage<{ [key: string]: unknown }>(
  "ensemble.storage",
  {},
  backingStorage,
);

export const useEnsembleStorage = (): EnsembleStorage => {
  const [storage, setStorage] = useAtom(screenStorageAtom);
  // Use a buffer so we can perform imperative changes without forcing re-render
  const storageBuffer = useMemo<{ [key: string]: unknown }>(() => ({}), []);

  useMemo(() => {
    merge(storageBuffer, storage);
  }, [storageBuffer, storage]);

  const storageApi = useMemo(
    () => createStorageApi(storageBuffer, setStorage),
    [setStorage, storageBuffer],
  );

  return storageApi;
};

export const createStorageApi = (
  storage?: { [key: string]: unknown },
  setStorage?: (storage: { [key: string]: unknown }) => void,
): EnsembleStorage => {
  return {
    set: (key: string, value: unknown): void => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const latestStorage: { [key: string]: unknown } = JSON.parse(
        sessionStorage.getItem("ensemble.storage") ?? "{}",
      );
      const nextStorage = merge(storage, latestStorage);
      nextStorage[key] = value;
      setStorage?.(clone(nextStorage));
    },
    get: (key: string): unknown => {
      return storage?.[key];
    },
    delete: (key: string): unknown => {
      const oldVal = storage?.[key];
      if (storage) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete storage[key];
        setStorage?.(clone(storage));
      }
      return oldVal;
    },
  };
};
