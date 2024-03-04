import { Provider, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import {
  appAtom,
  type ApplicationContextDefinition,
  defaultApplicationContext,
  themesAtom,
  screenAtom,
} from "../state";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared/models";
import { omit } from "lodash-es";

interface ApplicationContextProps {
  app: EnsembleAppModel;
  themes?: { [key: string]: EnsembleThemeModel };
}

type ApplicationContextProviderProps =
  React.PropsWithChildren<ApplicationContextProps>;

export const ApplicationContextProvider: React.FC<
  ApplicationContextProviderProps
> = ({ app, themes, children }) => {
  return (
    <Provider key={app.id}>
      <HydrateAtoms
        appContext={{
          ...defaultApplicationContext,
          application: app,
          env: app.config?.environmentVariables ?? {},
        }}
        themes={themes}
      >
        {children}
      </HydrateAtoms>
    </Provider>
  );
};

export const useApplicationContext =
  (): ApplicationContextDefinition | null => {
    const appContext = useAtomValue(appAtom);
    const themes = useAtomValue(themesAtom);
    const screen = useAtomValue(screenAtom);
    console.log({ themes, screen });
    return appContext;
  };

const HydrateAtoms: React.FC<
  React.PropsWithChildren<{
    appContext: ApplicationContextDefinition;
    themes?: Record<string, EnsembleThemeModel>;
  }>
> = ({ appContext, themes, children }) => {
  // initialising on state with prop on render here
  useHydrateAtoms([
    [
      appAtom,
      {
        ...appContext,
        application: { ...omit(appContext.application, ["themes"]) },
      },
    ],
  ]);
  useHydrateAtoms([[themesAtom, themes || {}]]);

  return <>{children}</>;
};
