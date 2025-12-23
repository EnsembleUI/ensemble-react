import { useEffect, useState } from "react";
import { error, type EnsembleAction } from "@ensembleui/react-framework";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "../hooks";

export const OnLoadAction: React.FC<
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
