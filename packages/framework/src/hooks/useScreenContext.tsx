import { Provider, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { ensembleStore, screenAtom, screenDataAtom } from "../state";
import type { ScreenContextActions, ScreenContextDefinition } from "../state";
import type { Response } from "../data";
import type { EnsembleScreenModel } from "../shared/models";

interface ScreenContextProps {
  screen: EnsembleScreenModel;
  context?: ScreenContextDefinition;
}

type ScreenContextProviderProps = React.PropsWithChildren<ScreenContextProps>;

export const ScreenContextProvider: React.FC<ScreenContextProviderProps> = ({
  screen,
  context,
  children,
}) => {
  useEffect(() => {
    if (context) {
      ensembleStore.set(screenAtom, context);
    } else {
      ensembleStore.set(screenAtom, {
        model: screen,
        widgets: {},
        data: {},
        storage: {},
      });
    }
  }, []);

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
