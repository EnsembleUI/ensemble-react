import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { EnsembleWidgetProps } from "../../util/types";
import { Expression } from "framework";

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

interface ChartDataSets {
  label?: string;
  data: number[];
  backgroundColor?: string;
  barPercentage?: number;
  borderRadius?: number;
}

export type BarChartProps = {
  labels?: string[] | undefined;
  datasets?: ChartDataSets[];
  title?: Expression<string>;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const BarChart: React.FC<BarChartProps> = (props) => {
  const { labels, datasets, title, styles } = props;

  return (
    <div
      style={{
        height: styles?.height || "100%",
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
