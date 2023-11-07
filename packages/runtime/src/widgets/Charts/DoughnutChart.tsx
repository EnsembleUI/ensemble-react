import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  type ScreenContextDefinition,
  evaluate,
  useScreenContext,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { get } from "lodash-es";
import { useMemo, useState } from "react";
import type { ChartDataSets, ChartProps } from "..";

const options: ChartOptions<"doughnut"> = {
  cutout: "90%",
  maintainAspectRatio: false,
};

export const DoughnutChart: React.FC<ChartProps> = (props) => {
  const { id, config, styles } = props;

  const [title, setTitle] = useState(config?.title);
  const [labels, setLabels] = useState<string[]>(config?.data?.labels || []);
  const context = useScreenContext();

  const evaluatedDatasets = useMemo(
    () =>
      evaluate(
        context as ScreenContextDefinition,
        JSON.stringify(config?.data?.datasets),
      ) as ChartDataSets[] | undefined,
    [config?.data?.datasets, context],
  );

  const { values } = useRegisterBindings({ labels, title }, id, {
    setLabels,
    setTitle,
  });

  return (
    <div
      style={{
        height: styles?.height || "100%",
        width: styles?.width || "100%",
      }}
    >
      <Doughnut
        data={{
          labels: values?.labels,
          datasets: evaluatedDatasets || [],
        }}
        options={{
          ...options,
          plugins: {
            title: {
              display: Boolean(values?.title),
              text: values?.title,
            },
          },
        }}
        style={{
          ...(get(props, "styles") as object),
        }}
      />
    </div>
  );
};
