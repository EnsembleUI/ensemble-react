import { useAtom } from "jotai";
import { clone, merge } from "lodash-es";
import { useMemo } from "react";
import type { EnsembleStorage } from "../storage";
import { screenStorageAtom } from "../storage";

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
