import {
  DataFetcher,
  isUsingMockResponse,
  type Response,
  type useScreenData,
  mockResponse,
} from "@ensembleui/react-framework";
import { has } from "lodash-es";

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

  // If mock resposne does not exist, fetch the data directly from the API
  const res = await DataFetcher.fetch(
    api,
    { ...apiInputs, ...context },
    {
      mockResponse: mockResponse(screenData.mockResponses[api.name]),
      useMockResponse: has(api, "mockResponse") && isUsingMockResponse(appId),
    },
  );

  screenData.setData(api.name, res);
  return res;
};
