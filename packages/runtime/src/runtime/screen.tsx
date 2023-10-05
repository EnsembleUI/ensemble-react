import type { EnsembleScreenModel } from "framework";
import { ScreenContextProvider } from "framework";
import { useEffect } from "react";
import { WidgetRegistry } from "../registry";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";

export interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({ screen }) => {
  const rootWidget = screen.body;
  const WidgetFn = WidgetRegistry.find(rootWidget.name);
  if (!(WidgetFn instanceof Function)) {
    throw new Error(`Unknown widget: ${rootWidget.name}`);
  }

  const onLoadAction = useEnsembleAction(screen.onLoad);

  useEffect(() => {
    if (!onLoadAction) {
      return;
    }
    onLoadAction.callback();
  }, [onLoadAction]);

  return (
    <ScreenContextProvider screen={screen}>
      <WidgetFn {...rootWidget.properties} />
    </ScreenContextProvider>
  );
};
