import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { get, merge } from "lodash-es";
import { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { ChartDataSets, ChartProps } from "..";

const options: ChartOptions<"doughnut"> = {
  cutout: "90%",
  maintainAspectRatio: false,
};

export const DoughnutChart: React.FC<ChartProps> = (props) => {
  const { id, config } = props;

  const [title, setTitle] = useState(config?.title);
  const [labels, setLabels] = useState<string[]>(config?.data?.labels || []);

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

  merge(
    options,
    {
      plugins: {
        title: {
          display: Boolean(values?.title),
          text: values?.title,
        },
      },
    },
    config?.options,
  );

  return (
    <Doughnut
      data={{
        labels: values?.labels,
        datasets: config?.data?.datasets as ChartDataSets[],
      }}
      options={options}
      style={{
        ...(get(props, "styles") as object),
      }}
    />
  );
};
