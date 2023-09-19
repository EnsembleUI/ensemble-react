import type { APIModel, EnsembleScreenModel, Widget } from "framework";
import {
  DataFetcher,
  ScreenContextProvider,
  useEnsembleStore,
} from "framework";
import type { ReactNode } from "react";
import { isValidElement, useEffect } from "react";
import { WidgetRegistry } from "../registry";

interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
}

const EnsembleScreen: React.FC<EnsembleScreenProps> = ({ screen }) => {
  const rootWidget: Widget = screen.body;
  const WidgetFn = WidgetRegistry.find(rootWidget.name);
  if (!(WidgetFn instanceof Function)) {
    throw new Error(`Unknown widget: ${rootWidget.name}`);
  }

  const { setData } = useEnsembleStore((state) => ({
    setData: state.screen.setData,
  }));

  useEffect(() => {
    const apiName = screen.onLoad?.name;
    const api = screen.apis?.find((model) => model.name === apiName);
    if (!api) {
      return;
    }
    const fetchAndSetContext = async (model: APIModel): Promise<void> => {
      const response = await DataFetcher.fetch(model);
      setData(model.name, response);
    };
    void fetchAndSetContext(api);
  });

  return (
    <ScreenContextProvider screen={screen}>
      <WidgetFn {...rootWidget.properties} />
    </ScreenContextProvider>
  );
};

export const EnsembleRuntime = {
  execute: (application: EnsembleScreenModel): ReactNode => {
    const rootWidget: Widget = application.body;
    const WidgetFn = WidgetRegistry.find(rootWidget.name);
    if (!(WidgetFn instanceof Function)) {
      throw new Error(`Unknown widget: ${rootWidget.name}`);
    }
    return <WidgetFn {...rootWidget.properties} />;
  },
  render: (widgets: Widget[]): ReactNode[] => {
    return widgets.map((child, index) => {
      const result = WidgetRegistry.find(child.name);
      if (isValidElement(result)) {
        return result;
      }
      const WidgetFn = result as React.FC<unknown>;
      return <WidgetFn {...child.properties} key={index} />;
    });
  },
  Screen: EnsembleScreen,
};
