import type {
  EnsembleAction,
  EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { ScreenContextProvider, error } from "@ensembleui/react-framework";
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useOutletContext } from "react-router-dom";
import { isEmpty, merge } from "lodash-es";
import { type WidgetComponent, WidgetRegistry } from "../registry";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";
import { EnsembleHeader } from "./header";
import { EnsembleFooter } from "./footer";
import { EnsembleBody } from "./body";
import { ModalWrapper } from "./modal";
import { createCustomWidget } from "./customWidget";
import type { EnsembleMenuContext } from "./menu";
import { EnsembleMenu } from "./menu";

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

  useEffect(() => {
    if (!screen.customWidgets || isEmpty(screen.customWidgets)) {
      setIsInitialized(true);
      return;
    }

    // initial widget values store
    const initialWidgetValues: {
      [key: string]: WidgetComponent<unknown>;
    } = {};

    // load screen custom widgets
    screen.customWidgets.forEach((customWidget) => {
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
      screen.customWidgets?.forEach((customWidget) => {
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

  useEffect(() => {
    const globalBlock = screen.global;
    const importedScripts = screen.importedScripts;

    const isScriptExist = document.getElementById("custom-scope-script");

    const jsString = `
      // Create a base object and pin its reference
      const ensembleObj = {};
      Object.defineProperty(window, 'ensemble', {
        get: () => ensembleObj,
        set: (value) => {
          // Copy properties instead of replacing reference
          Object.assign(ensembleObj, value);
          return true;
        },
        configurable: true,
        enumerable: true
      });

      const createEvalClosure = () => {
        ${importedScripts || ""}
        ${globalBlock || ""}
        
        return (scriptToExecute, context) => {
          with (context) {
            return eval('(' + scriptToExecute.toString() + ')()');
          }
        }
      }
      
      const evalInClosure = createEvalClosure()
    `;

    if (isScriptExist) {
      isScriptExist.textContent = jsString;
    } else {
      const script = document.createElement("script");
      script.id = "custom-scope-script";
      script.type = "text/javascript";
      script.textContent = jsString;

      document.body.appendChild(script);
    }
  }, [screen.global, screen.importedScripts]);

  if (!isInitialized) {
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

const OnLoadAction: React.FC<
  React.PropsWithChildren<{
    action?: EnsembleAction;
    context: { [key: string]: unknown };
  }>
> = ({ action, children, context }) => {
  const onLoadAction = useEnsembleAction(action);
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    if (!onLoadAction?.callback || isComplete) {
      return;
    }
    try {
      onLoadAction.callback(context);
    } catch (e) {
      error(e);
    } finally {
      setIsComplete(true);
    }
  }, [context, isComplete, onLoadAction?.callback]);

  return <>{children}</>;
};
