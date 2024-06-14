import { atomWithSessionStorage } from "./platform";

export type EnsembleUser = { accessToken?: string } & {
  [key: string]: unknown;
};

export const userAtom = atomWithSessionStorage<EnsembleUser>(
  "ensemble.user",
  {},
);
