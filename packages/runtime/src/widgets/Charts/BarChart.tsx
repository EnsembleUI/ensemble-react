import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  useRegisterBindings,
  evaluate,
  useScreenContext,
  ScreenContextDefinition,
} from "@ensembleui/react-framework";
import { useMemo, useState } from "react";
import { ChartProps } from "../";

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

export const BarChart: React.FC<ChartProps> = (props) => {
  const { id, styles, config } = props;

  const [title, setTitle] = useState(config?.title);
  const [labels, setLabels] = useState<string[]>(config?.labels || []);
  const context = useScreenContext();

  const evaluatedDatasets = useMemo(() => {
    return config?.datasets?.map((dataset) => ({
      ...dataset,
      data:
        typeof dataset.data === "string"
          ? evaluate(context as ScreenContextDefinition, dataset.data)
          : dataset.data,

      label: dataset.label?.startsWith("${")
        ? (evaluate(
            context as ScreenContextDefinition,
            dataset.label,
          ) as string)
        : dataset.label,
      backgroundColor:
        typeof dataset.backgroundColor === "string" &&
        dataset.backgroundColor.startsWith("${")
          ? (evaluate(
              context as ScreenContextDefinition,
              dataset.backgroundColor,
            ) as string | string[])
          : dataset.backgroundColor,
    }));
  }, [config?.datasets]);

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
      <Bar
        data={{
          labels: values?.labels,
          datasets: evaluatedDatasets!,
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
      />
    </div>
  );
};
