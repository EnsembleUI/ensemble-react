import { createContext, useContext } from "react";

export type CustomScope = Record<string, unknown>;
type CustomScopeProps = {
  value: CustomScope;
} & React.PropsWithChildren<CustomScope>;

export const CustomScopeContext = createContext<CustomScope | undefined>(
  undefined,
);

export const CustomScopeProvider: React.FC<CustomScopeProps> = ({
  children,
  value,
}) => {
  const parentScope = useCustomScope();
  return (
    <CustomScopeContext.Provider value={{ ...parentScope, ...value }}>
      {children}
    </CustomScopeContext.Provider>
  );
};

export const useCustomScope = (): CustomScope | undefined => {
  const scope = useContext(CustomScopeContext);
  return scope;
};
