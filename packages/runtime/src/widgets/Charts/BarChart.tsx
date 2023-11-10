import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  useRegisterBindings,
  evaluate,
  useScreenContext,
  type ScreenContextDefinition,
} from "@ensembleui/react-framework";
import { useMemo, useState } from "react";
import type { ChartDataSets, ChartProps } from "..";

const options: ChartOptions<"bar"> = {
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

export const BarChart: React.FC<ChartProps> = (props) => {
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

  console.log("BarChart", evaluatedDatasets);

  if (!evaluatedDatasets) return null;

  return (
    <div
      style={{
        height: styles?.height || "100%",
        width: styles?.width || "100%",
      }}
    >
      <Bar
        data={{
          labels: values?.labels,
          datasets: evaluatedDatasets as ChartDataSets[],
        }}
        options={{
          ...options,
          plugins: {
            title: {
              display: Boolean(values?.title),
              text: values?.title,
            },
          },
        }}
      />
    </div>
  );
};
