import { act, render, screen, waitFor } from "@testing-library/react";
import React, { useEffect } from "react";
import { Provider } from "jotai";
import { useEnsembleUser } from "../useEnsembleUser";

type Api = {
  setToken: (token?: string) => void;
};

const UserTokenProbe: React.FC<{
  id: string;
  onReady?: (api: Api) => void;
}> = ({ id, onReady }) => {
  const user = useEnsembleUser();

  useEffect(() => {
    onReady?.({
      setToken: (token?: string) => user.set({ accessToken: token }),
    });
  }, [onReady, user]);

  return (
    <div data-testid={`token-${id}`}>{String(user.accessToken ?? "")}</div>
  );
};

describe("userAtom cross-store sync", () => {
  beforeEach(() => {
    sessionStorage.removeItem("ensemble.user");
  });

  test("initializes from sessionStorage on first mount", async () => {
    sessionStorage.setItem(
      "ensemble.user",
      JSON.stringify({ accessToken: "seed" }),
    );

    render(
      <Provider>
        <UserTokenProbe id="one" />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("token-one").textContent).toBe("seed");
    });
  });

  test("propagates updates between nested Providers via storage sync", async () => {
    let apiA: Api | undefined;
    let apiB: Api | undefined;

    render(
      <Provider>
        <UserTokenProbe
          id="a"
          onReady={(api) => {
            apiA = api;
          }}
        />
        <Provider>
          <UserTokenProbe
            id="b"
            onReady={(api) => {
              apiB = api;
            }}
          />
        </Provider>
      </Provider>,
    );

    // outer updates, inner should reflect
    await act(async () => {
      apiA?.setToken("t1");
    });

    await waitFor(() => {
      expect(screen.getByTestId("token-a").textContent).toBe("t1");
      expect(screen.getByTestId("token-b").textContent).toBe("t1");
    });

    // inner updates, outer should reflect
    await act(async () => {
      apiB?.setToken("t2");
    });

    await waitFor(() => {
      expect(screen.getByTestId("token-a").textContent).toBe("t2");
      expect(screen.getByTestId("token-b").textContent).toBe("t2");
    });
  });
});
