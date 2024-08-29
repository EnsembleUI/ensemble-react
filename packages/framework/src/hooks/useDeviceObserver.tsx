import { atom, useAtom } from "jotai";
import { clone, debounce, merge } from "lodash-es";
import { useEffect, useMemo } from "react";

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

export const useDeviceObserver = (): DeviceDefinition => {
  const [data, setDataAtom] = useAtom(deviceAtom);

  const debouncedUpdateDeviceData = useMemo(() => {
    const handleResize = (): void => {
      if (
        window.innerWidth === data.width &&
        window.innerHeight === data.height
      ) {
        return;
      }
      setDataAtom(
        clone(
          merge({}, data, {
            width: window.innerWidth,
            height: window.innerHeight,
          }),
        ),
      );
    };

    return debounce(handleResize, 100);
  }, [data, setDataAtom]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(debouncedUpdateDeviceData);
    resizeObserver.observe(document.body);

    return (): void => {
      resizeObserver.disconnect();
      debouncedUpdateDeviceData.cancel(); // Cancel any pending debounced calls on cleanup
    };
  }, [debouncedUpdateDeviceData]);

  return {
    ...data,
  };
};
