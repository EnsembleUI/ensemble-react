import type { EnsembleScreenModel } from "@ensembleui/react-framework";
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
}

export const EnsembleScreen: React.FC<EnsembleScreenProps> = ({ screen }) => {
  const onLoadAction = useEnsembleAction(screen.onLoad);

  useEffect(() => {
    if (!onLoadAction) {
      return;
    }
    onLoadAction.callback();
  }, [onLoadAction]);

  return (
    <ScreenContextProvider screen={screen}>
      <EnsembleHeader header={screen.header} />
      <EnsembleBody
        body={screen.body}
        footer={screen.footer}
        header={screen.header}
      />
      <EnsembleFooter footer={screen.footer} />
    </ScreenContextProvider>
  );
};
