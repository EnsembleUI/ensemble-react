import { Provider, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useContext } from "react";
import { clone, merge } from "lodash-es";
import { useHydrateAtoms } from "jotai/utils";
import {
  appAtom,
  defaultScreenContext,
  locationAtom,
  screenAtom,
  screenDataAtom,
  themeAtom,
  userAtom,
  deviceAtom,
} from "../state";
import type {
  ApplicationContextDefinition,
  ScreenContextActions,
  ScreenContextDefinition,
} from "../state";
import type { Response, WebSocketConnection } from "../data";
import type { EnsembleScreenModel } from "../shared/models";
import { useApplicationContext } from "./useApplicationContext";
import { CustomThemeContext } from "./useThemeContext";

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
              device: useAtomValue(deviceAtom),
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
  const themeScope = useContext(CustomThemeContext);

  // initialising on state with prop on render here
  useHydrateAtoms([[screenAtom, screenContext]]);
  useHydrateAtoms(
    [
      [appAtom, appContext],
      [themeAtom, themeScope.theme],
      [userAtom, appContext.user],
    ],
    {
      dangerouslyForceHydrate: true,
    },
  );

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
    (name: string, response: Response | WebSocketConnection) => {
      const data = screenContext.data;
      data[name] = response;
      setDataAtom(clone(data));
    },
    [screenContext.data, setDataAtom],
  );
  return { ...screenContext, setData };
};
