import { ensembleStore, screenAtom } from "./state";

export const EnsembleStorage = {
  set: (key: string, value: unknown): void => {
    const screenContext = ensembleStore.get(screenAtom);
    screenContext.storage[key] = value;
    // FIXME: do more granular updates on screen context
    ensembleStore.set(screenAtom, { ...screenContext });
  },
  get: (key: string): unknown => {
    const screenContext = ensembleStore.get(screenAtom);
    return screenContext.storage[key];
  },
};
