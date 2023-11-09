import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { Expression } from "@ensembleui/react-framework";
import type { EnsembleWidgetProps } from "../../shared/types";

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

interface ChartDataSets {
  label?: string;
  data: number[];
  backgroundColor?: string;
  linePercentage?: number;
  borderRadius?: number;
}

export type LineChartProps = {
  labels?: string[] | undefined;
  datasets?: ChartDataSets[];
  title?: Expression<string>;
  options?: ChartOptions;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const LineChart: React.FC<LineChartProps> = (props) => {
  const { labels, datasets, title, styles, options } = props;

  return (
    <div
      style={{
        height: styles?.height || "100%",
        width: styles?.width || "100%",
      }}
    >
      <Line
        data={{
          labels,
          datasets: datasets!,
        }}
        options={{
          ...defaultOptions,
          ...(options as ChartOptions<"line">),
          plugins: {
            title: {
              display: Boolean(title),
              text: title,
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
