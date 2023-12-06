import { useAtom } from "jotai";
import { clone, merge } from "lodash-es";
import { useEffect, useMemo } from "react";
import type { EnsembleStorage } from "../storage";
import { screenStorageAtom } from "../storage";

export const useEnsembleStorage = (): EnsembleStorage => {
  const [storage, setStorage] = useAtom(screenStorageAtom);
  // Use a buffer so we can perform imperative changes without forcing re-render
  const storageBuffer = useMemo<Record<string, unknown>>(() => ({}), []);

  useEffect(() => {
    merge(storageBuffer, storage);
  }, [storageBuffer, storage]);

  const storageApi = useMemo(
    () => ({
      set: (key: string, value: unknown): void => {
        storageBuffer[key] = value;
        setStorage(clone(storageBuffer));
      },
      get: (key: string): unknown => {
        return storageBuffer[key];
      },
      delete: (key: string): unknown => {
        const oldVal = storageBuffer[key];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete storageBuffer[key];
        setStorage(clone(storageBuffer));
        return oldVal;
      },
    }),
    [setStorage, storageBuffer],
  );

  return storageApi;
};
