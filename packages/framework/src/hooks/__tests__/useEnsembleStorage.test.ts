import { act, renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { screenStorageAtom, useEnsembleStorage } from "../useEnsembleStorage";

const store = getDefaultStore();

describe("useEnsembleStorage", () => {
  test("fetches variable from storage", () => {
    store.set(screenStorageAtom, {
      test: "value",
    });
    const { result } = renderHook(() => useEnsembleStorage());

    const storage = result.current;

    expect(storage.get("test")).toBe("value");
  });

  test("sets variable in storage", () => {
    const { result } = renderHook(() => useEnsembleStorage());

    const storage = result.current;

    act(() => {
      storage.set("test", "bar");
    });

    expect(storage.get("test")).toBe("bar");
  });

  test("overwrites existing keys", () => {
    store.set(screenStorageAtom, {
      test: {
        foo: ["bar", "baz"],
        dead: {
          beef: "hello",
        },
      },
    });

    const { result } = renderHook(() => useEnsembleStorage());

    const storage = result.current;

    act(() => {
      storage.set("test", {
        foo: ["baz", "bar"],
        beef: {
          dead: "world",
        },
      });
    });

    expect(storage.get("test")).toMatchObject({
      foo: ["baz", "bar"],
      beef: {
        dead: "world",
      },
    });
  });

  test("deletes keys", () => {
    store.set(screenStorageAtom, {
      test: {
        foo: ["bar", "baz"],
        dead: {
          beef: "hello",
        },
      },
    });

    const { result } = renderHook(() => useEnsembleStorage());

    const storage = result.current;

    act(() => {
      storage.delete("test");
    });

    expect(storage.get("test")).toBeUndefined();
  });
});
