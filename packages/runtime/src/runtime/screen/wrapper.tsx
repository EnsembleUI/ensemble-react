import type { EnsembleAPIModel } from "@ensembleui/react-framework";
import { useScreenData } from "@ensembleui/react-framework";
import { useEffect } from "react";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "../hooks";

export const ScreenApiWrapper: React.FC = () => {
  const { apis = [], setApi } = useScreenData();

  return (
    <>
      {apis.map((api) => (
        <EvaluateApi api={api} key={api.name} setApi={setApi} />
      ))}
    </>
  );
};

const EvaluateApi = ({
  api,
  setApi,
}: {
  api: EnsembleAPIModel;
  setApi: (apiData: EnsembleAPIModel) => void;
}): null => {
  const onResponseAction = useEnsembleAction(api.onResponse);
  const onErrorAction = useEnsembleAction(api.onError);

  useEffect(() => {
    setApi({ ...api, onResponseAction, onErrorAction });
  }, [api.name]);

  return null;
};
