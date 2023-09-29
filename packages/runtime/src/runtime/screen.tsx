import type { EnsembleScreenModel, EnsembleAPIModel } from "framework";
import {
  useScreenContext,
  DataFetcher,
  ScreenContextProvider,
} from "framework";
import { useEffect } from "react";
import { WidgetRegistry } from "../registry";

export interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({ screen }) => {
  const rootWidget = screen.body;
  const WidgetFn = WidgetRegistry.find(rootWidget.name);
  if (!(WidgetFn instanceof Function)) {
    throw new Error(`Unknown widget: ${rootWidget.name}`);
  }

  const context = useScreenContext();

  useEffect(() => {
    // TODO: handle more actions
    if (
      !screen.onLoad ||
      typeof screen.onLoad !== "object" ||
      !("name" in screen.onLoad)
    ) {
      return;
    }

    const apiName = screen.onLoad.name;
    const api = screen.apis?.find((model) => model.name === apiName);
    if (!api || !context) {
      return;
    }
    const fetchAndSetContext = async (
      model: EnsembleAPIModel,
    ): Promise<void> => {
      const response = await DataFetcher.fetch(model);
      context.setData(model.name, response);
    };
    void fetchAndSetContext(api);
  }, []);

  return (
    <ScreenContextProvider screen={screen}>
      <WidgetFn {...rootWidget.properties} />
    </ScreenContextProvider>
  );
};
