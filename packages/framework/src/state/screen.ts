import { atom, useAtom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { clone } from "lodash-es";
import { useCallback } from "react";
import type { Response } from "../data";
import type {
  EnsembleAPIModel,
  EnsembleAppModel,
  EnsembleScreenModel,
} from "../shared";
import type { WidgetState } from "./widget";

export interface ScreenContextDefinition {
  app?: EnsembleAppModel;
  model?: EnsembleScreenModel;
  data: Record<string, Response | undefined>;
  widgets: Record<string, WidgetState | undefined>;
  [key: string]: unknown;
}

export interface ScreenContextActions {
  setWidget: (id: string, state: WidgetState) => void;
  setData: (name: string, response: Response) => void;
  setCustom: (id: string, data: unknown) => void;
}

export const defaultScreenContext = {
  model: undefined,
  data: {},
  widgets: {},
};

export const screenAtom = atom<ScreenContextDefinition>(defaultScreenContext);

export const screenDataAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("data"),
);

export const screenApiAtom = focusAtom(screenAtom, (optic) => {
  return optic.prop("model").optional().prop("apis");
});

export const screenInputAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("inputs"),
);

export const useScreenData = (): { apis?: EnsembleAPIModel[] } & Pick<
  ScreenContextDefinition,
  "data"
> &
  Pick<ScreenContextActions, "setData"> => {
  const apis = useAtomValue(screenApiAtom);
  const [data, setDataAtom] = useAtom(screenDataAtom);

  const setData = useCallback(
    (name: string, response: Response) => {
      data[name] = response;
      setDataAtom(clone(data));
    },
    [setDataAtom],
  );
  return {
    apis,
    data,
    setData,
  };
};
