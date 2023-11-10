import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useMemo, useState } from "react";
import {
  type ScreenContextDefinition,
  evaluate,
  useRegisterBindings,
  useScreenContext,
} from "@ensembleui/react-framework";
import type { ChartDataSets, ChartProps } from "..";

const defaultOptions: ChartOptions<"line"> = {
  maintainAspectRatio: false,
  scales: {
    x: {
      border: {
        display: true,
      },
      grid: {
        lineWidth: 0,
      },
    },
    y: {
      border: {
        display: false,
        dash: [2, 2],
      },
      grid: {
        lineWidth: 1,
        tickBorderDash: [1],
      },
    },
  },
};

export const LineChart: React.FC<ChartProps> = (props) => {
  const { id, styles, config } = props;

  const [title, setTitle] = useState(config?.title);
  const [labels, setLabels] = useState<string[]>(config?.data?.labels || []);
  const context = useScreenContext();

  const evaluatedDatasets = useMemo(
    () => evaluate(context as ScreenContextDefinition, config?.data?.datasets),
    [config?.data?.datasets, context],
  );

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

  if (!evaluatedDatasets) return null;

  return (
    <div
      style={{
        height: styles?.height || "100%",
        width: styles?.width || "100%",
      }}
    >
      <Line
        data={{
          labels: values?.labels,
          datasets: evaluatedDatasets as ChartDataSets[],
        }}
        options={{
          ...defaultOptions,
          ...(config?.options as ChartOptions<"line">),
          plugins: {
            title: {
              display: Boolean(values?.title),
              text: values?.title,
            },
            legend: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
};
