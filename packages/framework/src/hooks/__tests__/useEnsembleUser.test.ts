import { act, renderHook } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { get } from "lodash-es";
import { userAtom } from "../../state";
import { useEnsembleUser } from "../useEnsembleUser";

const store = getDefaultStore();

describe("useEnsembleUser", () => {
  beforeEach(() => {
    sessionStorage.removeItem("ensemble.user");
    store.set(userAtom, {} as unknown as { [key: string]: unknown });
  });

  test("fetches variable from ensemble.user", () => {
    store.set(userAtom, {
      accessToken: "eyJabcd",
    });
    const { result } = renderHook(() => useEnsembleUser());

    const user = result.current;

    expect(get(user, "accessToken")).toBe("eyJabcd");
  });

  test("sets variable in ensemble.user", () => {
    const { result } = renderHook(() => useEnsembleUser());

    const user = result.current;

    act(() => {
      user.set({ test: "bar" });
    });

    expect(get(store.get(userAtom), "test")).toBe("bar");
  });

  test("overwrites existing keys", () => {
    store.set(userAtom, {
      foo: ["bar", "baz"],
      dead: {
        beef: "hello",
      },
    });

    const { result } = renderHook(() => useEnsembleUser());

    const user = result.current;

    act(() => {
      user.set({
        foo: ["foo"],
        beef: {
          dead: "world",
        },
      });
    });

    expect(store.get(userAtom)).toMatchObject({
      foo: ["foo"],
      beef: {
        dead: "world",
      },
    });
  });

  test("returns sessionStorage snapshot on first render when atom empty", () => {
    sessionStorage.setItem(
      "ensemble.user",
      JSON.stringify({ accessToken: "seed", userDetails: { foo: "bar" } }),
    );

    const { result } = renderHook(() => useEnsembleUser());
    const user = result.current;

    expect(get(user, "accessToken")).toBe("seed");
    expect(get(user, "userDetails.foo")).toBe("bar");
  });

  test("prefers atom value over sessionStorage when atom populated", () => {
    sessionStorage.setItem(
      "ensemble.user",
      JSON.stringify({ accessToken: "seed" }),
    );
    store.set(userAtom, { accessToken: "live" });

    const { result } = renderHook(() => useEnsembleUser());
    const user = result.current;

    expect(get(user, "accessToken")).toBe("live");
  });
});
