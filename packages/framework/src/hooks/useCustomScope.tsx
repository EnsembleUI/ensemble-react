import { createContext, useContext } from "react";

type CustomScope = Record<string, unknown>;
type CustomScopeProps = {
  value: CustomScope;
} & React.PropsWithChildren<CustomScope>;

export const CustomScopeContext = createContext<CustomScope | null>(null);

export const CustomScopeProvider: React.FC<CustomScopeProps> = ({
  children,
  value,
}) => {
  return (
    <CustomScopeContext.Provider value={value}>
      {children}
    </CustomScopeContext.Provider>
  );
};

export const useCustomScope = (): CustomScope | null => {
  const scope = useContext(CustomScopeContext);
  return scope;
};
