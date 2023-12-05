import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { clone } from "lodash-es";
import { useCallback } from "react";
import { ensembleStore } from "./state/platform";
import { screenAtom } from "./state/screen";

export interface EnsembleStorage {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

// FIXME: updating storage does not trigger atom update, need atomEffect or something else to make reactive
export const EnsembleStorage: EnsembleStorage = {
  set: (key: string, value: unknown): void => {
    const screenContext = ensembleStore.get(screenAtom);
    screenContext.storage[key] = value;
    ensembleStore.set(screenAtom, screenContext);
  },
  get: (key: string): unknown => {
    const screenContext = ensembleStore.get(screenAtom);
    return screenContext.storage[key];
  },
  delete(key: string): unknown {
    const screenContext = ensembleStore.get(screenAtom);
    const oldValue = screenContext.storage[key];
    delete screenContext.storage[key];
    ensembleStore.set(screenAtom, screenContext);
    return oldValue;
  },
};

export const screenStorageAtom = focusAtom(screenAtom, (optic) => {
  return optic.prop("storage");
});

export const useScreenStorage = (): EnsembleStorage => {
  const [storage, setStorage] = useAtom(screenStorageAtom);

  const set = useCallback(
    (key: string, value: unknown) => {
      storage[key] = value;
      // console.log(`set${key}`);
      setStorage(clone(storage));
    },
    [setStorage, storage],
  );

  const get = useCallback((key: string) => {
    // console.log(`get${key}`);
    // console.log(storage);
    return EnsembleStorage.get(key);
  }, []);

  const _delete = useCallback(
    (key: string) => {
      delete storage[key];
      setStorage(clone(storage));
    },
    [setStorage, storage],
  );
  return {
    set,
    get,
    delete: _delete,
  };
};
