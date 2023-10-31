import type {
  EnsembleScreenModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useEffect } from "react";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";
import { EnsembleHeader } from "./header";
import { EnsembleFooter } from "./footer";
import { EnsembleBody } from "./body";
import { WidgetRegistry } from "../registry";

export interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
  inputs?: Record<string, unknown>;
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({
  screen,
  inputs,
}) => {
  const onLoadAction = useEnsembleAction(screen.onLoad);

  useEffect(() => {
    if (!onLoadAction) {
      return;
    }
    onLoadAction.callback();
  }, [onLoadAction]);

  const rootWidget = screen.body;
  const WidgetFn = WidgetRegistry.find(rootWidget.name);
  if (!(WidgetFn instanceof Function)) {
    throw new Error(`Unknown widget: ${rootWidget.name}`);
  }

  return (
    <ScreenContextProvider screen={screen}>
      <WidgetFn {...rootWidget.properties} />
    </ScreenContextProvider>
  );
};
