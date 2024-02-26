import { useAtom } from "jotai";
import { merge } from "lodash-es";
import { useMemo } from "react";
import { userAtom, type EnsembleUser } from "../state";

type EnsembleUserBuffer = {
  set: (items: Record<string, unknown>) => void;
};

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
