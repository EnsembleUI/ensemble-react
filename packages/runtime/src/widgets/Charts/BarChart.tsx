import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { EnsembleWidgetProps } from "..";

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
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const BarChart: React.FC<BarChartProps> = (props) => {
  const { labels, datasets } = props;

  return (
    <Bar
      data={{
        labels,
        datasets: datasets!,
      }}
      height={100}
      options={options}
      width={400}
    />
  );
};
