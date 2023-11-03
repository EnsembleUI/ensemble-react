import { createStore } from "jotai";
import { atomWithLocation } from "jotai-location";

export const locationAtom = atomWithLocation();

export const ensembleStore = createStore();
