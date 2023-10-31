import type {
  EnsembleScreenModel,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useEffect } from "react";
import { WidgetRegistry } from "../registry";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";

export interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({ screen }) => {
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

  const headerWidget = screen.header?.title;
  const HeaderFn = WidgetRegistry.find(
    (headerWidget as EnsembleWidget)?.name ?? "",
  );
  const footerWidget = screen.footer;
  const FooterFn = WidgetRegistry.find(
    (footerWidget as EnsembleWidget)?.name ?? "",
  );

  return (
    <ScreenContextProvider screen={screen}>
      {HeaderFn instanceof Function && (
        <HeaderFn {...(headerWidget as EnsembleWidget)?.properties} />
      )}
      <WidgetFn {...rootWidget.properties} />
      {FooterFn instanceof Function && (
        <FooterFn {...(footerWidget as EnsembleWidget)?.properties} />
      )}
    </ScreenContextProvider>
  );
};
