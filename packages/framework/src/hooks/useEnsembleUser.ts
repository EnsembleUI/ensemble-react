import { useAtom } from "jotai";
import { assign } from "lodash-es";
import { useMemo } from "react";
import { userAtom, type EnsembleUser } from "../state";

interface EnsembleUserBuffer {
  set: (items: { [key: string]: unknown }) => void;
}

export const useEnsembleUser = (): EnsembleUser & EnsembleUserBuffer => {
  const [user, setUser] = useAtom(userAtom);

  const storageBuffer = useMemo<EnsembleUserBuffer>(
    () => ({
      set: (items: { [key: string]: unknown }): void => {
        const updatedUser = assign({}, user, items);
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

  return { ...storageBuffer, ...user };
};
