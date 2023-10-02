import { Provider, useAtomValue } from "jotai";
import {
  appAtom,
  ensembleStore,
  type ApplicationContextDefinition,
} from "../state";
import type { EnsembleAppModel } from "../shared/models";

interface ApplicationContextProps {
  app: EnsembleAppModel;
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
