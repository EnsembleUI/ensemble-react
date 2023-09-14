import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { EnsembleWidgetProps } from "../../util/types";

const options: ChartOptions<"doughnut"> = {
  cutout: "90%",
};

interface ChartDataSets {
  label?: string;
  data: number[];
  backgroundColor?: string;
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
      data={{
        labels,
        datasets: datasets!,
      }}
      options={options}
      width="100px"
    />
  );
};
