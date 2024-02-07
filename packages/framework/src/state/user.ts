import { useAtom, atom } from "jotai";

export type EnsembleUser = { accessToken?: string } & Record<string, unknown>;

export const userAtom = atom<EnsembleUser>({});

export const useEnsembleUser = (): [
  EnsembleUser,
  (user: EnsembleUser) => void,
] => {
  const [user, setUser] = useAtom(userAtom);
  return [user, setUser];
};
