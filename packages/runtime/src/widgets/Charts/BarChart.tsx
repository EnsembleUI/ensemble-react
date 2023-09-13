import type { EnsembleWidgetProps } from "..";
import { Bar } from 'react-chartjs-2';
import {
  ChartOptions
} from "chart.js";

const options: ChartOptions<'bar'> = {
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
        dash: [2, 2]
      },
      grid: {
        lineWidth: 1,
        tickBorderDash: [1],
      }
    }
  }
}

type ChartDataSets = {
  label?: string;
  data: number[];
  backgroundColor?: string,
  barPercentage?: number,
  borderRadius?: number
}

export type BarChartProps = {
  labels?: string[] | undefined;
  datasets?: ChartDataSets[];
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const BarChart: React.FC<BarChartProps> = (props) => {
  const { labels, datasets } = props;

  return <Bar
    options={options}
    data={{
      labels,
      datasets: datasets!,
    }}
  />;
};