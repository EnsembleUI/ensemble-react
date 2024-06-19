import { createContext, useContext } from "react";

export interface CustomEventScope {
  [key: string]: unknown;
}

type CustomEventScopeProviderProps = {
  value?: CustomEventScope;
} & React.PropsWithChildren<CustomEventScope>;

export const CustomEventScopeContext = createContext<
  CustomEventScope | undefined
>(undefined);

export const useCustomEventScope = (): CustomEventScope | undefined => {
  return useContext(CustomEventScopeContext);
};

export const CustomEventScopeProvider: React.FC<
  CustomEventScopeProviderProps
> = ({ children, value }) => {
  const parentScope = useCustomEventScope();
  return (
    <CustomEventScopeContext.Provider value={{ ...parentScope, ...value }}>
      {children}
    </CustomEventScopeContext.Provider>
  );
};
