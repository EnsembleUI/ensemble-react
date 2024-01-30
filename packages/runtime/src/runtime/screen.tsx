import type {
  EnsembleAction,
  EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { ScreenContextProvider, error } from "@ensembleui/react-framework";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { merge } from "lodash-es";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";
import { EnsembleHeader } from "./header";
import { EnsembleFooter } from "./footer";
import { EnsembleBody } from "./body";

export interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
  inputs?: Record<string, unknown>;
  isModal?: boolean;
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({
  screen,
  inputs,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { state } = useLocation();
  const mergedInputs = merge({}, state as Record<string, unknown>, inputs);
  return (
    <ScreenContextProvider context={{ inputs: mergedInputs }} screen={screen}>
      <OnLoadAction action={screen.onLoad} context={{ ...mergedInputs }}>
        <EnsembleHeader header={screen.header} />
        <EnsembleBody body={screen.body} />
      </OnLoadAction>
      <EnsembleFooter footer={screen.footer} />
    </ScreenContextProvider>
  );
};

const OnLoadAction: React.FC<
  React.PropsWithChildren<{
    action?: EnsembleAction;
    context: Record<string, unknown>;
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
