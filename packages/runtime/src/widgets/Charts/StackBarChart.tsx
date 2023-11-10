import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { Expression } from "@ensembleui/react-framework";
import type { EnsembleWidgetProps } from "../../shared/types";

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
        dash: [2, 2],
      },
      grid: {
        lineWidth: 0,
      },
    },
  },
};

interface ChartDataSets {
  label?: string;
  data: number[];
  backgroundColor?: string;
  barPercentage?: number;
  borderRadius?: number;
}

type BarChartProps = {
  labels?: string[] | undefined;
  datasets?: ChartDataSets[];
  title?: Expression<string>;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const StackBarChart: React.FC<BarChartProps> = (props) => {
  const { labels, datasets, styles, title } = props;

  return (
    <div
      style={{
        width: styles?.width || "100%",
        height: styles?.height || "50px",
      }}
    >
      <Bar
        data={{
          labels,
          datasets: datasets!,
        }}
        options={{
          ...options,
          plugins: {
            ...options.plugins,
            title: {
              display: Boolean(title),
              text: title,
            },
          },
        }}
      />
    </div>
  );
};
