import { atom, useAtom } from "jotai";
import { createJSONStorage, atomWithStorage } from "jotai/utils";
import { assign, clone, isObject, merge } from "lodash-es";
import { useMemo } from "react";

export interface EnsembleStorage {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

const backingStorage = createJSONStorage<{ [key: string]: unknown }>(
  () => sessionStorage,
);

const screenStorageAtomInternal = atomWithStorage<{ [key: string]: unknown }>(
  "ensemble.storage",
  {},
  backingStorage,
);

export const screenStorageAtom = atom(
  (get) => get(screenStorageAtomInternal),
  (get, set, update) => {
    const currentData = get(screenStorageAtomInternal);
    // overwrite object keys
    if (isObject(update)) {
      const nextData = assign({}, currentData, update);
      set(screenStorageAtomInternal, nextData);
    }
  },
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
      const update: { [key: string]: unknown } = {};
      update[key] = value;
      if (storage) {
        assign(storage, update);
      }
      setStorage?.(update);
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
