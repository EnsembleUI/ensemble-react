import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useState } from "react";
import { type ChartProps } from "..";
import { getMergedOptions } from "./utils/getMergedOptions";

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
  const [labels, setLabels] = useState<string[]>(config?.data.labels || []);

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

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
          datasets: config?.data.datasets ?? [],
        }}
        options={getMergedOptions(options, values?.title, config?.options)}
        plugins={[ChartDataLabels, ...(config?.plugins || [])]}
      />
    </div>
  );
};
