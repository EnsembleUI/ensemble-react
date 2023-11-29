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
} from "../state";
import type {
  ApplicationContextDefinition,
  ScreenContextActions,
  ScreenContextDefinition,
} from "../state";
import type { Response } from "../data";
import type { EnsembleScreenModel } from "../shared/models";
import { useApplicationContext } from "./useApplicationContext";

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
              inputs: Object.fromEntries(location.searchParams ?? []),
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
  // initialising on state with prop on render here
  useHydrateAtoms([
    [appAtom, appContext],
    [screenAtom, screenContext],
  ]);
  return <>{children}</>;
};

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
