import { Provider, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import {
  appAtom,
  type ApplicationContextDefinition,
  defaultApplicationContext,
  currentThemeAtom,
} from "../state";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared/models";
import { merge } from "lodash-es";

interface ApplicationContextProps {
  app: EnsembleAppModel;
  themes?: { [key: string]: EnsembleThemeModel };
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

const HydrateAtoms: React.FC<
  React.PropsWithChildren<{
    appContext: ApplicationContextDefinition;
  }>
> = ({ appContext, children }) => {
  const activeTheme = useAtomValue(currentThemeAtom);

  // initialising on state with prop on render here
  useHydrateAtoms([
    [
      appAtom,
      {
        ...appContext,
        application: merge(appContext.application, {
          theme: appContext.application?.themes
            ? appContext.application.themes[activeTheme]
            : undefined,
        }),
      },
    ],
  ]);

  return <>{children}</>;
};
