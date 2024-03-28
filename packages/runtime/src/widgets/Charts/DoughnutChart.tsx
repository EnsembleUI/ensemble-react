import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { get } from "lodash-es";
import { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { type ChartProps } from "..";
import { getMergedOptions } from "./utils/getMergedOptions";

const options: ChartOptions<"doughnut"> = {
  cutout: "90%",
  maintainAspectRatio: false,
};

export const DoughnutChart: React.FC<ChartProps> = (props) => {
  const { id, config } = props;

  const [title, setTitle] = useState(config?.title);
  const [labels, setLabels] = useState<string[]>(config?.data.labels || []);

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

  return (
    <Doughnut
      data={{
        labels: values?.labels,
        datasets: config?.data.datasets ?? [],
      }}
      options={getMergedOptions(options, values?.title, config?.options)}
      style={{
        ...(get(props, "styles") as object),
      }}
    />
  );
};
