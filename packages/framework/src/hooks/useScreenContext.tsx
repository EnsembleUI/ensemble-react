import { Provider, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { merge } from "lodash-es";
import {
  ensembleStore,
  locationAtom,
  screenAtom,
  screenDataAtom,
} from "../state";
import type { ScreenContextActions, ScreenContextDefinition } from "../state";
import type { Response } from "../data";
import type { EnsembleScreenModel } from "../shared/models";

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
  useEffect(() => {
    const queryParams = Object.fromEntries(location.searchParams ?? []);
    // FIXME: guarantee ordering in resetting screen state
    const prevValue = ensembleStore.get(screenAtom);
    if (context) {
      ensembleStore.set(
        screenAtom,
        merge(prevValue, { inputs: queryParams }, context),
      );
    } else {
      ensembleStore.set(
        screenAtom,
        merge(prevValue, {
          model: screen,
          inputs: queryParams,
        }),
      );
    }
  }, [context, location.searchParams, screen]);

  return <Provider store={ensembleStore}>{children}</Provider>;
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
      setDataAtom(data);
    },
    [screenContext.data, setDataAtom],
  );
  return { ...screenContext, setData };
};
