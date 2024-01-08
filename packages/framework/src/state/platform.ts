import { getDefaultStore } from "jotai";
import { atomWithLocation } from "jotai-location";

export const locationAtom = atomWithLocation({
  replace: true,
});

/**
 * @deprecated DO NOT USE directly
 */
export const ensembleStore = getDefaultStore();
