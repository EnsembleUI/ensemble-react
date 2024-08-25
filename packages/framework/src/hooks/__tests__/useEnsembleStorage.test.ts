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
});
