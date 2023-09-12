import { createContext, useContext } from "react";
import type { EnsembleScreenModel } from "../models";
import type { ScreenContextDefinition } from "../state";

interface ScreenContextProps {
  screen: EnsembleScreenModel;
}
type ScreenContextProviderProps = React.PropsWithChildren<ScreenContextProps>;

export const ScreenContext = createContext<ScreenContextDefinition | null>(
  null,
);

export const ScreenContextProvider: React.FC<ScreenContextProviderProps> = ({
  children,
}) => {
  return (
    <ScreenContext.Provider value={{ data: {}, widgets: {} }}>
      {children}
    </ScreenContext.Provider>
  );
};

export const useScreenContext = (): ScreenContextDefinition | null => {
  const screenContext = useContext(ScreenContext);
  return screenContext;
};
