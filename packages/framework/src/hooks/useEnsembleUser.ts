import { useAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { merge } from "lodash-es";
import { useMemo } from "react";

export type EnsembleUser = { accessToken?: string } & Record<string, unknown>;
export type EnsembleUserBuffer = {
  set: (items: Record<string, unknown>) => void;
};

const backingStorage = createJSONStorage<Record<string, unknown>>(
  () => sessionStorage,
);

export const userAtom = atomWithStorage<EnsembleUser>(
  "ensemble.user",
  {},
  backingStorage,
);

export const useEnsembleUser = (): EnsembleUser & EnsembleUserBuffer => {
  const [user, setUser] = useAtom(userAtom);

  const storageBuffer = useMemo<EnsembleUserBuffer>(
    () => ({
      set: (items: Record<string, unknown>): void => {
        const updatedUser = merge({}, user, items);
        setUser(updatedUser);
      },
    }),
    [setUser, user],
  );

  useMemo(() => {
    merge(storageBuffer, user);
  }, [storageBuffer, user]);

  return storageBuffer;
};
