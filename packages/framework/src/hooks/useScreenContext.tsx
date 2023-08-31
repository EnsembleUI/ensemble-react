import { createContext, useContext } from "react";
import type { EnsembleScreen } from "../models";
import type { ScreenContext as IScreenContext } from "../state";

interface ScreenContextProps {
  screen: EnsembleScreen;
}
type ScreenContextProviderProps = React.PropsWithChildren<ScreenContextProps>;

export const ScreenContext = createContext<IScreenContext | null>(null);

export const ScreenContextProvider: React.FC<ScreenContextProviderProps> = ({
  children,
}) => {
  return (
    <ScreenContext.Provider value={{ data: null, widgets: {} }}>
      {children}
    </ScreenContext.Provider>
  );
};

export const useScreenContext = (): IScreenContext | null => {
  const screenContext = useContext(ScreenContext);
  return screenContext;
};
