import { screenAtom } from "./state/screen";
import { ensembleStore } from "./state/platform";

export interface EnsembleStorage {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => unknown;
}

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
