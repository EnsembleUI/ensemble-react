import { useAtom } from "jotai";
import { createJSONStorage, atomWithStorage } from "jotai/utils";
import { clone, merge } from "lodash-es";
import { useMemo } from "react";
import { type EnsembleStorage } from "../shared/ensemble";

const backingStorage = createJSONStorage<{ [key: string]: unknown }>(
  () => sessionStorage,
);

export const screenStorageAtom = atomWithStorage<{ [key: string]: unknown }>(
  "ensemble.storage",
  {},
  backingStorage,
  {
    getOnInit: true,
  },
);

export const useEnsembleStorage = (): EnsembleStorage => {
  const [storage, setStorage] = useAtom(screenStorageAtom);
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
    ...storage,
  };
};
