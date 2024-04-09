import { DataFetcher, evaluate } from "@ensembleui/react-framework";
import type {
  Response,
  ScreenContextDefinition,
  useScreenData,
} from "@ensembleui/react-framework";

export const invokeAPI = async (
  screen: ScreenContextDefinition,
  screenData: ReturnType<typeof useScreenData>,
  apiName: string,
  apiInputs?: { [key: string]: unknown },
  context?: { [key: string]: unknown },
): Promise<Response | undefined> => {
  const api = screenData.apis?.find((model) => model.name === apiName);
  if (!api) {
    return;
  }
  const evaluatedInputs = evaluate<{ [key: string]: unknown }>(
    screen,
    JSON.stringify(apiInputs),
    context,
  );
  screenData.setData(api.name, {
    isLoading: true,
    isError: false,
    isSuccess: false,
  });
  const res = await DataFetcher.fetch(api, { ...evaluatedInputs, ...context });
  screenData.setData(api.name, res);

  return res;
};
