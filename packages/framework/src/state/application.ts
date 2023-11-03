import { atom } from "jotai";
import type { EnsembleAppModel } from "../shared";

export interface ApplicationContextDefinition {
  application: EnsembleAppModel | null;
  storage: unknown;
  secrets: unknown;
  env: unknown;
  auth: unknown;
  user: unknown;
}

export interface ApplicationContextActions {
  setApplication: (app: EnsembleAppModel) => void;
}

export const appAtom = atom<ApplicationContextDefinition>({
  application: null,
  storage: null,
  env: null,
  auth: null,
  user: null,
  secrets: null,
});
