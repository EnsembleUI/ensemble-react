import type { EnsembleWidgetProps } from "..";
import { Doughnut } from 'react-chartjs-2';
import {
  ChartOptions
} from "chart.js";

const options: ChartOptions<'doughnut'> = {
  cutout: '90%'
}

type ChartDataSets = {
  label?: string;
  data: number[];
  backgroundColor?: string,
}

export type DoughnutChartProps = {
  labels?: string[] | undefined;
  datasets?: ChartDataSets[];
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const DoughnutChart: React.FC<DoughnutChartProps> = (props) => {
  const { labels, datasets } = props;

  return (
    <Doughnut
      options={options}
      data={{
        labels,
        datasets: datasets!,
      }}
    />);
};