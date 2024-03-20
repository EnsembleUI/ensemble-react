import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useState } from "react";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { get } from "lodash-es";
import { type ChartDataSets, type ChartProps } from "..";
import { getMergedOptions } from "./utils/getMergedOptions";

const options: ChartOptions<"bar"> = {
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: {
    legend: {
      display: false,
      position: "top",
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
      },
      grid: {
        lineWidth: 0,
      },
    },
  },
};

export const StackBarChart: React.FC<ChartProps> = (props) => {
  const { id, config } = props;

  const [title, setTitle] = useState(config?.title);
  const [labels, setLabels] = useState<string[]>(config?.data?.labels || []);

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

  return (
    <Bar
      data={{
        labels: values?.labels,
        datasets: config?.data?.datasets as ChartDataSets[],
      }}
      options={getMergedOptions(options, values?.title, config?.options)}
      plugins={[ChartDataLabels, ...(config?.plugins || [])]}
      style={{
        ...(get(props, "styles") as object),
      }}
    />
  );
};
