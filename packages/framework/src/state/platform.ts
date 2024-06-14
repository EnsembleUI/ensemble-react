import { atom, getDefaultStore, type WritableAtom } from "jotai";
import { atomWithLocation } from "jotai-location";

export const locationAtom = atomWithLocation({
  replace: true,
});

// Custom storage atom so it's writable and hydrate-able so values remain consistent
export const atomWithSessionStorage = <T = unknown>(
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

/**
 * @deprecated DO NOT USE directly
 */
export const ensembleStore = getDefaultStore();
