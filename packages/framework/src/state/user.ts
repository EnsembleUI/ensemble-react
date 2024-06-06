import type { WritableAtom } from "jotai";
import { atom } from "jotai";

export type EnsembleUser = { accessToken?: string } & {
  [key: string]: unknown;
};

// Custom storage atom so it's writable and hydrate-able so values remain consistent
const atomWithSessionStorage = <T = unknown>(
  key: string,
  initialValue: T,
): WritableAtom<T, unknown[], unknown> => {
  const getInitialValue = (): T => {
    const item = sessionStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item) as T;
    }
    return initialValue;
  };
  const baseAtom = atom<T>(getInitialValue());
  const derivedAtom = atom<T, unknown[], unknown>(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = (
        typeof update === "function" ? update(get(baseAtom)) : update
      ) as T;
      set(baseAtom, nextValue);
      sessionStorage.setItem(key, JSON.stringify(nextValue));
    },
  );
  return derivedAtom;
};

export const userAtom = atomWithSessionStorage<EnsembleUser>(
  "ensemble.user",
  {},
);
