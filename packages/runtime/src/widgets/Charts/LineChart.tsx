import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { getMergedOptions, type ChartDataSets, type ChartProps } from "..";
import { get } from "lodash-es";

const options: ChartOptions<"line"> = {
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
  const { id, config } = props;

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
      options={getMergedOptions(options, values?.title, config?.options)}
      style={{
        ...(get(props, "styles") as object),
      }}
    />
  );
};
