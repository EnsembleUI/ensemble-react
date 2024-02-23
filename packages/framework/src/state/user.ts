import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type EnsembleUser = { accessToken?: string } & Record<string, unknown>;

const backingStorage = createJSONStorage<Record<string, unknown>>(
  () => sessionStorage,
);

export const userAtom = atomWithStorage<EnsembleUser>(
  "ensemble.user",
  {},
  {
    ...backingStorage,
    subscribe: (key: string, callback: (value: EnsembleUser) => void) => {
      const storageEventCallback = (e: StorageEvent) => {
        if (e.key === key) {
          const newValue = sessionStorage.getItem(key);
          if (newValue) {
            callback(JSON.parse(newValue) as EnsembleUser);
          }
        }
      };
      window.addEventListener("storage", storageEventCallback);
      return () => {
        window.removeEventListener("storage", storageEventCallback);
      };
    },
  },
);
