import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
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

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

  return (
    <Line
      data={{
        labels: values?.labels,
        datasets: config?.data?.datasets as ChartDataSets[],
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
  );
};
