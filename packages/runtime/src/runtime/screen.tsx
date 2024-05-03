import type {
  EnsembleAction,
  EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { ScreenContextProvider, error } from "@ensembleui/react-framework";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { isEmpty, merge } from "lodash-es";
import { WidgetRegistry } from "../registry";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";
import { EnsembleHeader } from "./header";
import { EnsembleFooter } from "./footer";
import { EnsembleBody } from "./body";
import { ModalWrapper } from "./modal";
import { createCustomWidget } from "./customWidget";

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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const routeParams = useParams(); // route params
  const params = new URLSearchParams(search); // query params
  const queryParams: { [key: string]: unknown } = Object.fromEntries(params);

  const mergedInputs = merge(
    {},
    state as { [key: string]: unknown },
    routeParams,
    queryParams,
    inputs,
  );

  useEffect(() => {
    if (!screen.customWidgets || isEmpty(screen.customWidgets)) {
      setIsLoaded(true);
      return;
    }

    // load screen custom widgets
    screen.customWidgets.forEach((customWidget) => {
      WidgetRegistry.register(
        customWidget.name,
        createCustomWidget(customWidget),
      );
    });

    setIsLoaded(true);

    return () => {
      // unMount screen custom widgets
      screen.customWidgets.forEach((customWidget) => {
        WidgetRegistry.unMount(customWidget.name);
      });
    };
  }, [screen.customWidgets]);

  if (!isLoaded) {
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
  }, [context, isComplete, onLoadAction, onLoadAction?.callback]);

  return <>{children}</>;
};
