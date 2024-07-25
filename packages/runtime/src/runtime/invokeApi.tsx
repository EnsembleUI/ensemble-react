import { DataFetcher, type EnsembleMockResponse, type Response, type useScreenData } from "@ensembleui/react-framework";

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

  // Now, because the API exists, set its state to loading
  screenData.setData(api.name, {
    isLoading: true,
    isError: false,
    isSuccess: false,
  });

  // Check to see if mockResponse is enabled and if a mockResponse exists in the API context
  if (api.mockResponse) {
    const mockResProps = api.mockResponse as EnsembleMockResponse;
    const isSuccess = mockResProps.statusCode >= 200 && mockResProps.statusCode <= 299;
    const mockRes = {
      ...mockResProps,
      isLoading: false,
      isSuccess: isSuccess,
      isError: !isSuccess,
    };
    screenData.setData(api.name, mockRes);
    return mockRes;
  }

  // If mock resposne does not exist, fetch the data directly from the API
  const res = await DataFetcher.fetch(api, { ...apiInputs, ...context });
  const newRes = { ...res, apiInputs, context }

  screenData.setData(api.name, newRes);
  return res;
};
