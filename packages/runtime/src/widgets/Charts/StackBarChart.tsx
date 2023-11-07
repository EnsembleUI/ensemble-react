import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  evaluate,
  useScreenContext,
  ScreenContextDefinition,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { useMemo, useState } from "react";
import { ChartDataSets, ChartProps } from ".";

const options: ChartOptions<"bar"> = {
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  scales: {
    x: {
      display: false,
      stacked: true,
      ticks: {
        display: false,
      },
      border: {
        display: true,
      },
      grid: {
        lineWidth: 0,
      },
    },
    y: {
      display: false,
      ticks: {
        display: false,
      },
      stacked: true,
      border: {
        display: false,
        dash: [2, 2],
      },
      grid: {
        lineWidth: 0,
      },
    },
  },
};

export const StackBarChart: React.FC<ChartProps> = (props) => {
  const { id, styles, config } = props;

  const [title, setTitle] = useState(config?.title);
  const [labels, setLabels] = useState<string[]>(config?.data?.labels || []);
  const context = useScreenContext();

  const evaluatedDatasets = useMemo(
    () =>
      evaluate(
        context as ScreenContextDefinition,
        JSON.stringify(config?.data?.datasets),
      ) as ChartDataSets[] | undefined,
    [config?.data?.datasets],
  );

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

  return (
    <div
      style={{
        height: styles?.height || "20px",
        width: styles?.width || "100%",
      }}
    >
      <Bar
        data={{
          labels: values?.labels,
          datasets: evaluatedDatasets || [],
        }}
        options={{
          ...options,
          plugins: {
            ...options.plugins,
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
