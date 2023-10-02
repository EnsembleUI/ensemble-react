import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { EnsembleWidgetProps } from "../../util/types";
import { Expression } from "framework";

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
        height: styles?.height || "20px",
        width: styles?.width || "100%",
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
              display: !!title,
              text: title,
            },
          },
        }}
      />
    </div>
  );
};
