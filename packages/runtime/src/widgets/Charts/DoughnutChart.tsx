import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { EnsembleWidgetProps } from "../../util/types";
import { Expression } from "framework";

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
  const { labels, datasets, title, styles } = props;

  return (
    <div
      style={{
        height: styles?.height || "100%",
        width: styles?.width || "100%",
      }}
    >
      <Doughnut
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
