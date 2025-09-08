import type { WritableAtom } from "jotai";
import { atom } from "jotai";
import { setUserInStorage } from "../utils/userStorage";

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
  // initialise from sessionStorage so first render sees the latest value
  const baseAtom = atom<T>(getInitialValue());

  // keep all jotai stores in sync by listening to storage events
  // this is required because we create nested Providers (separate stores)
  // and without syncing, a later Provider may see stale values
  baseAtom.onMount = (setAtom) => {
    // set initial value from storage on first mount for this store
    try {
      setAtom(getInitialValue());
    } catch {
      setAtom(initialValue);
    }

    const handler = (event: StorageEvent): void => {
      if (event.key !== key) return;
      try {
        const next = event.newValue
          ? (JSON.parse(event.newValue) as T)
          : getInitialValue();
        setAtom(next);
      } catch {
        setAtom(getInitialValue());
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handler);
      }
    };
  };
  const derivedAtom = atom<T, unknown[], unknown>(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = (
        typeof update === "function" ? update(get(baseAtom)) : update
      ) as T;
      set(baseAtom, nextValue);
      if (key === "ensemble.user") {
        setUserInStorage(nextValue);
      } else {
        sessionStorage.setItem(key, JSON.stringify(nextValue));
      }
      // notify other stores in this tab to update immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new StorageEvent("storage", { key }));
      }
    },
  );
  return derivedAtom;
};

export const userAtom = atomWithSessionStorage<EnsembleUser>(
  "ensemble.user",
  {},
);
