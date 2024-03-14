import { Provider, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { clone, merge } from "lodash-es";
import { useHydrateAtoms } from "jotai/utils";
import {
  appAtom,
  defaultScreenContext,
  locationAtom,
  screenAtom,
  screenDataAtom,
  themeAtom,
} from "../state";
import type {
  ApplicationContextDefinition,
  ScreenContextActions,
  ScreenContextDefinition,
} from "../state";
import type { Response } from "../data";
import type { EnsembleScreenModel } from "../shared/models";
import { useApplicationContext } from "./useApplicationContext";
import { useTheme } from "./useThemeContext";

interface ScreenContextProps {
  screen: EnsembleScreenModel;
  context?: Partial<ScreenContextDefinition>;
}

type ScreenContextProviderProps = React.PropsWithChildren<ScreenContextProps>;

export const ScreenContextProvider: React.FC<ScreenContextProviderProps> = ({
  screen,
  context,
  children,
}) => {
  const [location] = useAtom(locationAtom);
  const appContext = useApplicationContext();

  if (!appContext) {
    throw new Error("Missing application context for screen!");
  }

  return (
    <Provider key={screen.name}>
      <HydrateAtoms
        appContext={appContext}
        screenContext={
          merge(
            {},
            defaultScreenContext,
            {
              app: appContext.application,
              model: screen,
              inputs: Object.fromEntries(
                location.searchParams?.entries() ?? [],
              ),
            },
            context,
          ) as ScreenContextDefinition
        }
      >
        {children}
      </HydrateAtoms>
    </Provider>
  );
};

const HydrateAtoms: React.FC<
  React.PropsWithChildren<{
    appContext: ApplicationContextDefinition;
    screenContext: ScreenContextDefinition;
  }>
> = ({ appContext, screenContext, children }) => {
  const themeScope = useTheme();

  // initialising on state with prop on render here
  useHydrateAtoms([
    [appAtom, appContext],
    [screenAtom, screenContext],
  ]);
  useHydrateAtoms([[themeAtom, themeScope.theme]], {
    dangerouslyForceHydrate: true,
  });

  return <>{children}</>;
};

/**
 * @deprecated Re-renders component each time screen context changes which
 * can be very expensive. Only used for rare cases where full context is
 * needed.
 *
 * Consider using `createBinding` instead which will construct a custom scope
 * of just the referenced dependencies in the expression/script.
 *
 * @returns the full state of the current screen
 */
export const useScreenContext = ():
  | (ScreenContextDefinition & Pick<ScreenContextActions, "setData">)
  | null => {
  const screenContext = useAtomValue(screenAtom);
  const setDataAtom = useSetAtom(screenDataAtom);
  const setData = useCallback(
    (name: string, response: Response) => {
      const data = screenContext.data;
      data[name] = response;
      setDataAtom(clone(data));
    },
    [screenContext.data, setDataAtom],
  );
  return { ...screenContext, setData };
};
