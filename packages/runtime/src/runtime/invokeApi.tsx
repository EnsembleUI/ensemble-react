import {
  DataFetcher,
  useApplicationContext,
  useEvaluate,
  useMockResponse,
  type Response,
  type useScreenData,
} from "@ensembleui/react-framework";

export const invokeAPI = async (
  screenData: ReturnType<typeof useScreenData>,
  apiName: string,
  apiInputs?: { [key: string]: unknown },
  context?: { [key: string]: unknown },
): Promise<Response | undefined> => {
  const api = screenData.apis?.find((model) => model.name === apiName);
  const evaluatedMockResponse = useEvaluate(
    { response: api?.mockResponse },
    { context },
  );
  const appData = useApplicationContext();

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
  if (api.mockResponse && useMockResponse(appData?.application?.id)) {
    // Ensure that the mock response contains a correctly formatted
    if (typeof evaluatedMockResponse.response !== "object")
      throw new Error(
        "Improperly formatted mock response: Malformed mockResponse object",
      );

    if (
      !evaluatedMockResponse.response.statusCode ||
      typeof evaluatedMockResponse.response.statusCode !== "number"
    )
      throw new Error(
        "Improperly formatted mock response: Incorrect Status Code. Please check that you have included a status code and that it is a number",
      );

    const isSuccess =
      evaluatedMockResponse.response.statusCode >= 200 &&
      evaluatedMockResponse.response.statusCode <= 299;
    const mockRes = {
      ...evaluatedMockResponse.response,
      isLoading: false,
      isSuccess,
      isError: !isSuccess,
    };
    screenData.setData(api.name, mockRes);
    return mockRes;
  }

  // If mock resposne does not exist, fetch the data directly from the API
  const res = await DataFetcher.fetch(api, { ...apiInputs, ...context });

  screenData.setData(api.name, res);
  return res;
};
