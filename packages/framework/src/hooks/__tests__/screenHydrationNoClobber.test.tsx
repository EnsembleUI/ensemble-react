import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "jotai";
import { ApplicationContextProvider } from "../useApplicationContext";
import { ScreenContextProvider } from "../useScreenContext";
import type { EnsembleAppModel } from "../../shared";
import { useEnsembleUser } from "../useEnsembleUser";

const Probe: React.FC<{ id: string }> = ({ id }) => {
  const user = useEnsembleUser();
  return <div data-testid={`u-${id}`}>{String(user.accessToken ?? "")}</div>;
};

const BootstrapUser: React.FC = () => {
  const user = useEnsembleUser();
  React.useEffect(() => {
    user.set({ accessToken: "fresh" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const app: EnsembleAppModel = {
  id: "app",
  screens: [],
  customWidgets: [],
  scripts: [],
  home: {
    id: "home",
    name: "home",
    body: { name: "Text", properties: { text: "home" } },
  },
  themes: { default: { name: "default" } },
};

describe("ScreenContextProvider does not clobber user atom", () => {
  test("user stays latest when screen mounts", async () => {
    render(
      <Provider>
        <ApplicationContextProvider app={app}>
          <BootstrapUser />
          <Probe id="before" />
          <ScreenContextProvider screen={{ name: "home" }}>
            <Probe id="after" />
          </ScreenContextProvider>
        </ApplicationContextProvider>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("u-before").textContent).toBe("fresh");
      expect(screen.getByTestId("u-after").textContent).toBe("fresh");
    });
  });
});
