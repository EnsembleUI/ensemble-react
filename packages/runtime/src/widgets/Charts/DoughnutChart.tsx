import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { Expression } from "@ensembleui/react-framework";
import type { EnsembleWidgetProps } from "../../shared/types";

const options: ChartOptions<"doughnut"> = {
  cutout: "90%",
  maintainAspectRatio: false,
};

interface ChartDataSets {
  label?: string;
  data: number[];
  backgroundColor?: string;
}

export type DoughnutChartProps = {
  labels?: string[] | undefined;
  datasets?: ChartDataSets[];
  title?: Expression<string>;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const DoughnutChart: React.FC<DoughnutChartProps> = (props) => {
  const { labels, datasets, title } = props;

  return (
    <Doughnut
      data={{
        labels,
        datasets: datasets!,
      }}
      options={{
        ...options,
        plugins: {
          title: {
            display: Boolean(title),
            text: title,
          },
        },
      }}
    />
  );
};
