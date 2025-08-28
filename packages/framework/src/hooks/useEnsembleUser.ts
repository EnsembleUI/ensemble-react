import { useAtom } from "jotai";
import { assign, isEmpty } from "lodash-es";
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

  // ensure first render on direct loads sees latest value from sessionStorage
  const sessionSnapshot = useMemo<EnsembleUser>(() => {
    try {
      const raw = sessionStorage.getItem("ensemble.user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const effectiveUser = isEmpty(user) ? sessionSnapshot : user;

  return { ...storageBuffer, ...effectiveUser };
};
