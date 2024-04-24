import { useAtom } from "jotai";
import { createJSONStorage, atomWithStorage } from "jotai/utils";
import { clone, cloneDeep } from "lodash-es";
import { useMemo } from "react";

export interface EnsembleStorage {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

const backingStorage = createJSONStorage<Record<string, unknown>>(
  () => sessionStorage,
);

export const screenStorageAtom = atomWithStorage<Record<string, unknown>>(
  "ensemble.storage",
  {},
  backingStorage,
);

export const useEnsembleStorage = (): EnsembleStorage => {
  const [storage, setStorage] = useAtom(screenStorageAtom);

  const storageApi = useMemo(
    () => createStorageApi(storage, setStorage),
    [setStorage, storage],
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
        storage[key] = cloneDeep(value);
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
