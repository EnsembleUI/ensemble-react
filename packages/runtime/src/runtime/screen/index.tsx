import type { EnsembleScreenModel } from "@ensembleui/react-framework";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useOutletContext } from "react-router-dom";
import { isEmpty, merge } from "lodash-es";
import { type WidgetComponent, WidgetRegistry } from "../../registry";
// eslint-disable-next-line import/no-cycle
import { EnsembleHeader } from "../header";
import { EnsembleFooter } from "../footer";
import { EnsembleBody } from "../body";
import { ModalWrapper } from "../modal";
import { createCustomWidget } from "../customWidget";
import type { EnsembleMenuContext } from "../menu";
import { EnsembleMenu } from "../menu";
import { useProcessApiDefinitions } from "../hooks/useProcessApiDefinitions";
import { OnLoadAction } from "./onLoadAction";

export interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
  inputs?: { [key: string]: unknown };
  isModal?: boolean;
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({
  screen,
  inputs,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { state, search, pathname } = useLocation();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isAPIProcessed, setIsAPIProcessed] = useState<boolean>(false);
  const routeParams = useParams(); // route params
  const params = new URLSearchParams(search); // query params
  const queryParams: { [key: string]: unknown } = Object.fromEntries(params);

  const outletContext = useOutletContext<EnsembleMenuContext>();

  const mergedInputs: { [key: string]: unknown } = merge(
    screen.inputs?.reduce<{ [key: string]: undefined }>((acc, item: string) => {
      acc[item] = undefined;
      return acc;
    }, {}),
    state as { [key: string]: unknown },
    { ...outletContext },
    routeParams,
    queryParams,
    inputs,
  ) as { [key: string]: unknown };

  const processedAPIs = useProcessApiDefinitions(screen.apis);

  useEffect(() => {
    if (isEmpty(screen.apis)) {
      setIsAPIProcessed(true);
      return;
    }

    screen.apis = processedAPIs;
    setIsAPIProcessed(true);
  }, [processedAPIs, screen]);

  useEffect(() => {
    // Ensure customWidgets is defined before using it
    const customWidgets = screen.customWidgets || [];

    if (isEmpty(customWidgets)) {
      setIsInitialized(true);
      return;
    }

    // initial widget values store
    const initialWidgetValues: {
      [key: string]: WidgetComponent<unknown>;
    } = {};

    // load screen custom widgets
    customWidgets.forEach((customWidget) => {
      const originalImplementation = WidgetRegistry.findOrNull(
        customWidget.name,
      );
      if (originalImplementation) {
        initialWidgetValues[customWidget.name] = originalImplementation;
      }

      WidgetRegistry.register(
        customWidget.name,
        createCustomWidget(customWidget),
      );
    });

    setIsInitialized(true);

    return () => {
      // unMount screen custom widgets
      customWidgets.forEach((customWidget) => {
        WidgetRegistry.unregister(customWidget.name);
        if (customWidget.name in initialWidgetValues) {
          WidgetRegistry.register(
            customWidget.name,
            initialWidgetValues[customWidget.name],
          );
        }
      });
    };
  }, [screen.customWidgets]);

  if (!isInitialized || !isAPIProcessed) {
    return null;
  }

  return (
    <ScreenContextProvider
      context={{ inputs: mergedInputs }}
      key={pathname}
      screen={screen}
    >
      <ModalWrapper>
        <OnLoadAction action={screen.onLoad} context={{ ...mergedInputs }}>
          <EnsembleHeader header={screen.header} />
          <EnsembleBody body={screen.body} styles={screen.styles} />
        </OnLoadAction>
        {screen.menu ? (
          <EnsembleMenu
            menu={{ ...screen.menu }}
            renderOutlet={false}
            type={screen.menu.type}
          />
        ) : null}
        <EnsembleFooter footer={screen.footer} />
      </ModalWrapper>
    </ScreenContextProvider>
  );
};
