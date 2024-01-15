import { Provider, useAtomValue } from "jotai";
import { useAtomCallback, useHydrateAtoms } from "jotai/utils";
import {
  appAtom,
  type ApplicationContextDefinition,
  defaultApplicationContext,
} from "../state";
import type { EnsembleAppModel, EnsembleMenuModel } from "../shared/models";
import { useCallback } from "react";

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
          env: app.config?.environmentVariables ?? {},
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

export const useUpdateApplicationContext = (): ((
  context: Partial<ApplicationContextDefinition>,
) => void) => {
  const appContextCallback = useAtomCallback(
    useCallback((get, set, context: Partial<ApplicationContextDefinition>) => {
      const appContext = get(appAtom);
      set(appAtom, { ...appContext, ...context });
    }, []),
  );
  return appContextCallback;
};

const HydrateAtoms: React.FC<
  React.PropsWithChildren<{ appContext: ApplicationContextDefinition }>
> = ({ appContext, children }) => {
  // initialising on state with prop on render here
  useHydrateAtoms([[appAtom, appContext]]);
  return <>{children}</>;
};
