import { Provider, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { isEmpty, merge } from "lodash-es";
import { useTranslation } from "react-i18next";
import {
  appAtom,
  type ApplicationContextDefinition,
  defaultApplicationContext,
  selectedThemeNameAtom,
  themeAtom,
  userAtom,
} from "../state";
import type { EnsembleAppModel } from "../shared/models";
import { useEnsembleUser } from "./useEnsembleUser";

interface ApplicationContextProps {
  app: EnsembleAppModel;
  environmentOverrides?: { [key: string]: unknown };
}

type ApplicationContextProviderProps =
  React.PropsWithChildren<ApplicationContextProps>;

export const ApplicationContextProvider: React.FC<
  ApplicationContextProviderProps
> = ({ app, environmentOverrides, children }) => {
  const user = useEnsembleUser();
  const { i18n } = useTranslation();

  // load all the langauges
  app.languages?.forEach((langauge) => {
    i18n.addResources(langauge.languageCode, "translation", langauge.resources);
  });

  return (
    <Provider key={app.id}>
      <HydrateAtoms
        appContext={{
          ...defaultApplicationContext,
          application: app,
          env: merge(
            {},
            app.config?.environmentVariables,
            environmentOverrides,
          ),
          user,
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
  const activeThemeName = useAtomValue(selectedThemeNameAtom);

  let activeTheme = appContext.application?.theme;
  if (!isEmpty(appContext.application?.themes)) {
    activeTheme = appContext.application?.themes[activeThemeName];
  }

  // initialising on state with prop on render here
  useHydrateAtoms([
    [appAtom, appContext],
    [themeAtom, activeTheme],
    [userAtom, appContext.user],
  ]);

  return <>{children}</>;
};
