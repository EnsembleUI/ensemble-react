import { atom, useAtom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { clone } from "lodash-es";
import { useCallback } from "react";
import isEqual from "react-fast-compare";
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
  data: { [key: string]: Response | undefined };
  widgets: { [key: string]: WidgetState | undefined };
  inputs?: { [key: string]: unknown };
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

export const screenGlobalScriptAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("model").optional().prop("global"),
);

export const screenImportScriptAtom = focusAtom(screenAtom, (optic) =>
  optic.prop("model").optional().prop("importedScripts"),
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
      if (isEqual(data[name], response)) {
        return;
      }
      data[name] = response;
      setDataAtom(clone(data));
    },
    [data, setDataAtom],
  );
  return {
    apis,
    data,
    setData,
  };
};
