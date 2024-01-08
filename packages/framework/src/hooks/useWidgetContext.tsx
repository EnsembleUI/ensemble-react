import React from "react";
import { useHydrateAtoms } from "jotai/utils";
import { merge } from "lodash-es";
import { Provider } from "jotai";
import type { EnsembleWidgetModel } from "../shared";
import {
  type WidgetContextDefinition,
  defaultWidgetContext,
  widgetAtom,
} from "../state";

interface WidgetContextProps {
  widget: EnsembleWidgetModel;
}

type WidgetContextProviderProps = React.PropsWithChildren<WidgetContextProps>;

export const WidgetContextProvider: React.FC<WidgetContextProviderProps> = ({
  widget,
  children,
}) => {
  return (
    <Provider key={widget.name}>
      <HydrateAtoms
        widgetContext={
          merge({}, defaultWidgetContext, {
            model: widget,
          }) as WidgetContextDefinition
        }
      >
        {children}
      </HydrateAtoms>
    </Provider>
  );
};

const HydrateAtoms: React.FC<
  React.PropsWithChildren<{
    widgetContext: WidgetContextDefinition;
  }>
> = ({ widgetContext, children }) => {
  useHydrateAtoms([[widgetAtom, widgetContext]]);

  return <>{children}</>;
};
