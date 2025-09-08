import { useAtom } from "jotai";
import { assign, isEmpty } from "lodash-es";
import { useMemo } from "react";
import { userAtom, type EnsembleUser } from "../state";
import { getUserFromStorage } from "../utils/userStorage";

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
    return getUserFromStorage();
  }, []);

  const effectiveUser = isEmpty(user) ? sessionSnapshot : user;

  return { ...storageBuffer, ...effectiveUser };
};

export const createUserApi = (
  getUser: () => EnsembleUser,
  setUser?: (user: EnsembleUser) => void,
) => {
  const currentUser = getUser();
  return {
    ...currentUser,
    set: (userUpdate: EnsembleUser): void => {
      const user = getUser();
      const updatedUser = assign({}, user, userUpdate);
      setUser?.(updatedUser);
    },
    setUser: (userUpdate: EnsembleUser): void => {
      setUser?.(userUpdate);
    },
    get: (key: string): unknown => {
      return getUser()[key];
    },
  };
};
