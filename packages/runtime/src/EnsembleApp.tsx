import { useEffect, useMemo, useRef } from "react";
import type { ApplicationDTO } from "framework";
import {
  ApplicationContextProvider,
  ApplicationLoader,
  EnsembleParser,
} from "framework";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { injectStyle } from "react-toastify/dist/inject-style";
import { ThemeProvider } from "./ThemeProvider";
import { EnsembleEntry } from "./runtime/entry";
import { EnsembleScreen } from "./runtime/screen";
import { ErrorPage } from "./runtime/error";
// Register built in widgets;
import "./widgets";
import { GlobalModalWrapper, GlobalModal } from "react-global-modal-plus";
import { CustomModal } from "./runtime/modal";

injectStyle();
export interface EnsembleAppProps {
  appId: string;
  application?: ApplicationDTO;
}

export const EnsembleApp: React.FC<EnsembleAppProps> = ({
  appId,
  application,
}) => {
  const resolvedApp = application ?? ApplicationLoader.load(appId);
  const app = EnsembleParser.parseApplication(resolvedApp);

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: <ModalRouteWrapper />,
          children: [
            {
              path: "/",
              element: <EnsembleEntry entry={app.home} />,
              errorElement: <ErrorPage />,
              children: app.screens.map((screen) => {
                const screenId = screen.name.toLowerCase();
                return {
                  path: `${screenId}`,
                  element: <EnsembleScreen key={screenId} screen={screen} />,
                };
              }),
            },
          ],
        },
      ]),
    [app],
  );
  return (
    <ApplicationContextProvider app={app}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ThemeProvider>
    </ApplicationContextProvider>
  );
};

const ModalRouteWrapper: React.FC = () => {
  const globalModalRef = useRef(null);

  useEffect(() => GlobalModal.setUpModal(globalModalRef.current), []);

  return (
    <>
      <Outlet />
      <GlobalModalWrapper customModal={CustomModal} ref={globalModalRef} />
    </>
  );
};
