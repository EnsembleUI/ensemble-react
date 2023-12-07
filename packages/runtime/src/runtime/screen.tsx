import type {
  EnsembleAction,
  EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useEffect } from "react";
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
  isModal,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { state } = useLocation();
  const mergedInputs = merge({}, state as Record<string, unknown>, inputs);
  return (
    <ScreenContextProvider context={{ inputs: mergedInputs }} screen={screen}>
      <OnLoadAction action={screen.onLoad}>
        <EnsembleHeader header={screen.header} />
        <EnsembleBody
          body={screen.body}
          footer={screen.footer}
          header={screen.header}
          isModal={isModal}
        />
      </OnLoadAction>
      <EnsembleFooter footer={screen.footer} />
    </ScreenContextProvider>
  );
};

const OnLoadAction: React.FC<
  React.PropsWithChildren<{ action?: EnsembleAction }>
> = ({ action, children }) => {
  const onLoadAction = useEnsembleAction(action);

  useEffect(() => {
    if (!onLoadAction?.callback) {
      return;
    }
    onLoadAction.callback();
  }, [onLoadAction, onLoadAction?.callback]);

  return <>{children}</>;
};
