import type { EnsembleAPIModel } from "@ensembleui/react-framework";
import { useScreenData } from "@ensembleui/react-framework";
import { useEffect } from "react";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "../hooks";

export const ScreenApiWrapper: React.FC = () => {
  const { apis = [], setApi } = useScreenData();

  return (
    <>
      {apis.map((api, index) => (
        <EvaluateApi
          api={api}
          currentIndex={index}
          key={api.name}
          setApi={setApi}
        />
      ))}
    </>
  );
};

const EvaluateApi = ({
  api,
  currentIndex,
  setApi,
}: {
  api: EnsembleAPIModel;
  currentIndex: number;
  setApi: (name: number, apiData: EnsembleAPIModel) => void;
}): null => {
  const onResponseAction = useEnsembleAction(api.onResponse);
  const onErrorAction = useEnsembleAction(api.onError);

  useEffect(() => {
    setApi(currentIndex, { ...api, onResponseAction, onErrorAction });
  }, [currentIndex]);

  return null;
};
