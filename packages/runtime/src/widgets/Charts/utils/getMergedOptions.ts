import { type ChartOptions } from "chart.js";
import { merge } from "lodash-es";
import { type ChartConfigs } from "..";

export const getMergedOptions = (
  defaultOptions: ChartOptions<Exclude<ChartConfigs["type"], "stackbar">>,
  title?: string,
  configOptions?: ChartOptions,
) =>
  merge(
    {},
    defaultOptions,
    {
      plugins: {
        title: {
          display: Boolean(title),
          text: title,
        },
      },
    },
    configOptions,
  );
