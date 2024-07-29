import { Provider, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { keys, merge, values } from "lodash-es";
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
    i18n.addResourceBundle(
      langauge.languageCode,
      "translation",
      langauge.resources,
    );
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
          secrets: merge({}, app.config?.secretVariables),
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

  let activeTheme = null;
  if (activeThemeName) {
    activeTheme = appContext.application?.themes?.[activeThemeName];
  } else {
    activeTheme = values(appContext.application?.themes ?? {})[0];
  }

  // initialising on state with prop on render here
  useHydrateAtoms([
    [appAtom, appContext],
    [themeAtom, activeTheme],
    [userAtom, appContext.user],
    [
      selectedThemeNameAtom,
      activeThemeName || keys(appContext.application?.themes)[0],
    ],
  ]);

  return <>{children}</>;
};
