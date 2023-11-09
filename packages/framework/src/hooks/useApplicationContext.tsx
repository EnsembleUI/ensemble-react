import { Provider, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import {
  appAtom,
  type ApplicationContextDefinition,
  defaultApplicationContext,
} from "../state";
import type { EnsembleAppModel } from "../shared/models";
import { EnsembleStorage } from "../storage";

interface ApplicationContextProps {
  app: EnsembleAppModel;
}

type ApplicationContextProviderProps =
  React.PropsWithChildren<ApplicationContextProps>;

export const ApplicationContextProvider: React.FC<
  ApplicationContextProviderProps
> = ({ app, children }) => {
  return (
    <Provider key={app.id}>
      <HydrateAtoms
        appContext={{
          ...defaultApplicationContext,
          application: app,
          storage: EnsembleStorage,
        }}
      >
        {children}
      </HydrateAtoms>
    </Provider>
  );
};

export const useApplicationContext =
  (): ApplicationContextDefinition | null => {
    const appContext = useAtomValue(appAtom);
    return appContext;
  };

const HydrateAtoms: React.FC<
  React.PropsWithChildren<{ appContext: ApplicationContextDefinition }>
> = ({ appContext, children }) => {
  // initialising on state with prop on render here
  useHydrateAtoms([[appAtom, appContext]]);
  return <>{children}</>;
};
