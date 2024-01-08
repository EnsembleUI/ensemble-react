import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { backingStorage } from "../hooks/useEnsembleStorage";

export type EnsembleUser = { accessToken?: string } & Record<string, unknown>;

export const userAtom = atomWithStorage<EnsembleUser>(
  "ensemble.user",
  {},
  backingStorage,
);

export const useEnsembleUser = (): [
  EnsembleUser,
  (user: EnsembleUser) => void,
] => {
  const [user, setUser] = useAtom(userAtom);
  return [user, setUser];
};
