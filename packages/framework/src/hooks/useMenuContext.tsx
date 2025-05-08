import type { PropsWithChildren } from "react";
import React from "react";
import { useHydrateAtoms } from "jotai/utils";
import { menuImportScriptAtom } from "../state";

interface MenuContextProps {
  menuImportedScripts: string | undefined;
}

type MenuContextProviderProps = PropsWithChildren<MenuContextProps>;

const HydrateMenuAtoms: React.FC<MenuContextProviderProps> = ({
  menuImportedScripts,
  children,
}) => {
  useHydrateAtoms([[menuImportScriptAtom, menuImportedScripts]]);
  return <>{children}</>;
};

export const MenuContextProvider: React.FC<MenuContextProviderProps> = ({
  menuImportedScripts,
  children,
}) => {
  return (
    <HydrateMenuAtoms menuImportedScripts={menuImportedScripts}>
      {children}
    </HydrateMenuAtoms>
  );
};
