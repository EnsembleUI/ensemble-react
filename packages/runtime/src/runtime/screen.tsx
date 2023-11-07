import type {
  EnsembleAction,
  EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { ScreenContextProvider } from "@ensembleui/react-framework";
import { useEffect } from "react";
// FIXME: refactor
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks/useEnsembleAction";
import { EnsembleHeader } from "./header";
import { EnsembleFooter } from "./footer";
import { EnsembleBody } from "./body";

export interface EnsembleScreenProps {
  screen: EnsembleScreenModel;
  inputs?: Record<string, unknown>;
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({
  screen,
  inputs,
}) => {
  return (
    <ScreenContextProvider
      context={inputs ? { inputs } : undefined}
      screen={screen}
    >
      <OnLoadAction action={screen.onLoad}>
        <EnsembleHeader header={screen.header} />
        <EnsembleBody
          body={screen.body}
          footer={screen.footer}
          header={screen.header}
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
    if (!onLoadAction) {
      return;
    }
    onLoadAction.callback();
  }, [onLoadAction]);

  return <>{children}</>;
};
