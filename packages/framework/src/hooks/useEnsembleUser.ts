import { useAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { merge } from "lodash-es";
import { useMemo } from "react";

type EnsembleUser = { accessToken?: string } & Record<string, unknown>;
type EnsembleUserBuffer = {
  set: (items: Record<string, unknown>) => void;
};

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

export const useEnsembleUser = (): EnsembleUser & EnsembleUserBuffer => {
  const [user, setUser] = useAtom(userAtom);

  const storageBuffer = useMemo<EnsembleUserBuffer>(
    () => ({
      set: (items: Record<string, unknown>): void => {
        const updatedUser = merge({}, user, items);
        setUser(updatedUser);
        window.dispatchEvent(
          new StorageEvent("storage", { key: "ensemble.user" }),
        );
      },
      get: (key: string): unknown => {
        return user[key];
      },
    }),
    [setUser, user],
  );

  useMemo(() => {
    merge(storageBuffer, user);
  }, [storageBuffer, user]);

  return storageBuffer;
};
