import { Provider, useAtomValue } from "jotai";
import type { Application } from "../models";
import {
  appAtom,
  ensembleStore,
  type ApplicationContextDefinition,
} from "../state";

interface ApplicationContextProps {
  app: Application;
}

type ApplicationContextProviderProps =
  React.PropsWithChildren<ApplicationContextProps>;

export const ApplicationContextProvider: React.FC<
  ApplicationContextProviderProps
> = ({ app, children }) => {
  const appAtomValue = ensembleStore.get(appAtom);
  ensembleStore.set(appAtom, { ...appAtomValue, application: app });
  return <Provider store={ensembleStore}>{children}</Provider>;
};

export const useApplicationContext =
  (): ApplicationContextDefinition | null => {
    const appContext = useAtomValue(appAtom);
    return appContext;
  };
