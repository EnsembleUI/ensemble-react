import { DataFetcher } from "@ensembleui/react-framework";
import type { Response, useScreenData } from "@ensembleui/react-framework";

export const invokeAPI = async (
  screenData: ReturnType<typeof useScreenData>,
  apiName: string,
  apiInputs?: { [key: string]: unknown },
  context?: { [key: string]: unknown },
): Promise<Response | undefined> => {
  const api = screenData.apis?.find((model) => model.name === apiName);
  if (!api) {
    return;
  }

  screenData.setData(api.name, {
    isLoading: true,
    isError: false,
    isSuccess: false,
  });
  const res = await DataFetcher.fetch(api, { ...apiInputs, ...context });
  screenData.setData(api.name, res);

  return res;
};
