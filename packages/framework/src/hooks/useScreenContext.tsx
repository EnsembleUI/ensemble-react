import { createContext, useContext } from "react";
import type { EnsembleScreen } from "../models";
import type { ScreenContextDefinition } from "../state";

interface ScreenContextProps {
  screen: EnsembleScreen;
}
type ScreenContextProviderProps = React.PropsWithChildren<ScreenContextProps>;

export const ScreenContext = createContext<ScreenContextDefinition | null>(
  null,
);

export const ScreenContextProvider: React.FC<ScreenContextProviderProps> = ({
  children,
}) => {
  return (
    <ScreenContext.Provider value={{ data: null, widgets: {} }}>
      {children}
    </ScreenContext.Provider>
  );
};

export const useScreenContext = (): ScreenContextDefinition | null => {
  const screenContext = useContext(ScreenContext);
  return screenContext;
};
