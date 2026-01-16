import type { Getter } from "jotai";
import { atom, useAtom } from "jotai";
import { createJSONStorage, atomWithStorage } from "jotai/utils";
import { assign, get as lodashGet, has, isObject, merge } from "lodash-es";
import { useMemo } from "react";

const DELETE_COMMAND = "_ensembleInternalCommand_DELETE";
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
    if (has(update, DELETE_COMMAND)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete currentData[String(lodashGet(update, DELETE_COMMAND))];
      const nextData = assign({}, currentData);
      set(screenStorageAtomInternal, nextData);
    } else if (isObject(update)) {
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
  get?: Getter,
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
      if (get) return get(screenStorageAtom)[key];
      return storage?.[key];
    },
    delete: (key: string): unknown => {
      const oldVal = storage?.[key];
      if (storage) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete storage[key];
      }
      const command: { [key: string]: unknown } = {};
      command[DELETE_COMMAND] = key;
      setStorage?.(command);
      return oldVal;
    },
  };
};
