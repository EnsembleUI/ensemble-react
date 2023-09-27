import { Provider, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import type { EnsembleScreenModel } from "../models";
import { ensembleStore, screenAtom, screenDataAtom } from "../state";
import type { ScreenContextActions, ScreenContextDefinition } from "../state";
import type { Response } from "../data";

interface ScreenContextProps {
  screen: EnsembleScreenModel;
}
type ScreenContextProviderProps = React.PropsWithChildren<ScreenContextProps>;

export const ScreenContextProvider: React.FC<ScreenContextProviderProps> = ({
  children,
}) => {
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
