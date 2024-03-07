import { useCallback } from "react";
import { merge } from "lodash-es";
import { atom, useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import type { EnsembleAppModel } from "../shared";
import type { EnsembleUser } from "./user";
import { screenAtom } from "./screen";

export interface ApplicationContextDefinition {
  application: EnsembleAppModel | undefined;
  storage: unknown;
  secrets: unknown;
  env: Record<string, unknown>;
  auth: unknown;
  user: EnsembleUser | null;
}

export interface ApplicationContextActions {
  setApplication: (app: EnsembleAppModel) => void;
}

export const defaultApplicationContext = {
  application: undefined,
  storage: null,
  env: {},
  auth: null,
  user: null,
  secrets: null,
};

export const appAtom = atom<ApplicationContextDefinition>(
  defaultApplicationContext,
);

export const themeAtom = focusAtom(appAtom, (optics) =>
  optics.path("application").optional().prop("theme"),
);

export const currentThemeAtom = atom<string>("default");

export const envAtom = focusAtom(appAtom, (optic) => optic.prop("env"));

export const useSetTheme = (): {
  themeName: string;
  setTheme: (name: string) => void;
} => {
  const [themeName, setThemeName] = useAtom(currentThemeAtom);
  const [appContext, setApp] = useAtom(appAtom);
  const [screenContext, setScreen] = useAtom(screenAtom);

  const setTheme = useCallback(
    (name: string) => {
      setThemeName(name);
      const newTheme = appContext?.application?.themes
        ? appContext.application.themes[name]
        : undefined;

      if (newTheme) {
        setApp({
          ...appContext,
          application: merge(appContext.application, {
            theme: newTheme,
          }),
        });

        setScreen({
          ...screenContext,
          app: merge(screenContext.app, {
            theme: newTheme,
          }),
        });
      }
    },
    [setThemeName],
  );

  return { themeName, setTheme };
};
