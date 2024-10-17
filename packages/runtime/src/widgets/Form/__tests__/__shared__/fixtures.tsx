import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { ScreenContextProvider } from "@ensembleui/react-framework";

export const FormTestWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <BrowserRouter>
      <ScreenContextProvider
        screen={{
          id: "formTest",
          name: "formTest",
          body: { name: "Column", properties: {} },
        }}
      >
        {children}
      </ScreenContextProvider>
    </BrowserRouter>
  );
};
