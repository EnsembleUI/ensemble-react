import { createContext, useContext } from "react";
import type { Application } from "../models";
import type { ApplicationContextDefinition } from "../state";

interface ApplicationContextProps {
  app: Application;
}

type ApplicationContextProviderProps =
  React.PropsWithChildren<ApplicationContextProps>;

export const ApplicationContext =
  createContext<ApplicationContextDefinition | null>(null);

export const ApplicationContextProvider: React.FC<
  ApplicationContextProviderProps
> = ({ app, children }) => {
  return (
    <ApplicationContext.Provider
      value={{
        application: app,
        storage: null,
        secrets: null,
        env: null,
        auth: null,
        user: null,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext =
  (): ApplicationContextDefinition | null => {
    const appContext = useContext(ApplicationContext);
    return appContext;
  };
