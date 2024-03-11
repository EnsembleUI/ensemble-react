import { Provider, useAtom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import {
  appAtom,
  type ApplicationContextDefinition,
  defaultApplicationContext,
  currentThemeAtom,
  themeAtom,
} from "../state";
import type { EnsembleAppModel, EnsembleThemeModel } from "../shared/models";

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
  const activeThemeName = useAtomValue(currentThemeAtom);
  const [_, updateTheme] = useAtom(themeAtom);
  let activeTheme = undefined;

  if (appContext.application?.themes) {
    activeTheme = appContext.application?.themes
      ? appContext.application.themes[activeThemeName]
      : undefined;
  } else {
    activeTheme = appContext.application?.theme;
  }

  // initialising on state with prop on render here
  useHydrateAtoms([[appAtom, appContext]]);
  updateTheme(activeTheme);

  return <>{children}</>;
};
