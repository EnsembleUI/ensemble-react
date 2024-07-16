import { atom, useAtom } from "jotai";
import { clone, merge } from "lodash-es";
import { useCallback } from "react";

// https://wicg.github.io/ua-client-hints/#navigatorua
declare interface NavigatorUA {
  readonly userAgentData?: UALowEntropyJSON;
}

// https://wicg.github.io/ua-client-hints/#dictdef-navigatoruabrandversion
interface NavigatorUABrandVersion {
  readonly brand: string;
  readonly version: string;
}

// https://wicg.github.io/ua-client-hints/#dictdef-ualowentropyjson
interface UALowEntropyJSON {
  readonly brands: NavigatorUABrandVersion[];
  readonly mobile: boolean;
  readonly platform: string;
}

export interface DeviceActions {
  setData: (values: { [key: string]: unknown }) => void;
}

export interface DeviceDefinition {
  platform: string;
  width: number;
  height: number;
  [key: string]: unknown;
}

export const defaultDevice = {
  platform:
    (navigator as Navigator & NavigatorUA).userAgentData?.platform || "",
  width: 0,
  height: 0,
};

export const deviceAtom = atom<DeviceDefinition>(defaultDevice);

export const useDeviceData = (): DeviceDefinition &
  Pick<DeviceActions, "setData"> => {
  const [data, setDataAtom] = useAtom(deviceAtom);

  const setData = useCallback(
    (values: { [key: string]: unknown }) => {
      setDataAtom(clone(merge({}, data, values)));
    },
    [data, setDataAtom],
  );

  return {
    ...data,
    setData,
  };
};
