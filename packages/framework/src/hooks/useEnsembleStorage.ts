import { useAtom } from "jotai";
import { createJSONStorage, atomWithStorage } from "jotai/utils";
import { clone, merge } from "lodash-es";
import { useMemo } from "react";

export interface EnsembleStorage {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

export const backingStorage = createJSONStorage<Record<string, unknown>>(
  () => sessionStorage,
);

export const screenStorageAtom = atomWithStorage<Record<string, unknown>>(
  "ensemble.storage",
  {},
  backingStorage,
);

export const useEnsembleStorage = (): EnsembleStorage => {
  const [storage, setStorage] = useAtom(screenStorageAtom);
  // Use a buffer so we can perform imperative changes without forcing re-render
  const storageBuffer = useMemo<Record<string, unknown>>(() => ({}), []);

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
  storage?: Record<string, unknown>,
  setStorage?: (storage: Record<string, unknown>) => void,
): EnsembleStorage => {
  return {
    set: (key: string, value: unknown): void => {
      if (storage) {
        storage[key] = value;
        setStorage?.(clone(storage));
      }
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
