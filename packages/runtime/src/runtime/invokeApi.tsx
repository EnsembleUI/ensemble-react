import {
  DataFetcher,
  isUsingMockResponse,
  type Response,
  type useScreenData,
} from "@ensembleui/react-framework";
import { mock } from "./mock";

export const invokeAPI = async (
  screenData: ReturnType<typeof useScreenData>,
  apiName: string,
  appId: string | undefined,
  apiInputs?: { [key: string]: unknown },
  context?: { [key: string]: unknown },
): Promise<Response | undefined> => {
  const api = screenData.apis?.find((model) => model.name === apiName);

  if (!api) {
    return;
  }

  // Now, because the API exists, set its state to loading
  screenData.setData(api.name, {
    isLoading: true,
    isError: false,
    isSuccess: false,
  });

  // Check to see if mockResponse is enabled and if a mockResponse exists in the API context
  if (api.mockResponse && isUsingMockResponse(appId)) {
    const res = mock({ response: screenData.mockResponses[api.name] });
    screenData.setData(api.name, res);
    return res;
  }

  // If mock resposne does not exist, fetch the data directly from the API
  const res = await DataFetcher.fetch(api, { ...apiInputs, ...context });

  screenData.setData(api.name, res);
  return res;
};
