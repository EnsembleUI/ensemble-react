import {
  DataFetcher,
  evaluate,
  type ScreenContextDefinition,
  type useScreenData,
} from "@ensembleui/react-framework";

export const invokeAPI = async (
  screen: ScreenContextDefinition,
  screenData: ReturnType<typeof useScreenData>,
  apiName: string,
  apiInputs?: { [key: string]: unknown },
  context?: { [key: string]: unknown },
) => {
  const api = screenData.apis?.find((model) => model.name === apiName);
  if (!api) {
    return;
  }
  const evaluatedInputs = evaluate<{ [key: string]: unknown }>(
    screen,
    JSON.stringify(apiInputs),
    context,
  );
  const res = await DataFetcher.fetch(api, evaluatedInputs);
  screenData.setData(api.name, res);

  return res;
};
