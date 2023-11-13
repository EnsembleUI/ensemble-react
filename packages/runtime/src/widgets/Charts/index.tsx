import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  type ChartOptions,
} from "chart.js";
import React, { cloneElement, useMemo } from "react";
import {
  evaluate,
  type ScreenContextDefinition,
  type Expression,
  useScreenContext,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetProps } from "../../util/types";
import { BarChart } from "./BarChart";
import { DoughnutChart } from "./DoughnutChart";
import { StackBarChart } from "./StackBarChart";
import { LineChart } from "./LineChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

export interface ChartDataSets {
  data: Expression<number[]>;
  label?: string;
  backgroundColor?: string[] | string;
  barPercentage?: number;
  borderRadius?: number;
  borderColor?: string[] | string;
  borderWidth?: number;
  [key: string]: unknown;
}

export interface ChartConfigs {
  type: "bar" | "doughnut" | "stackbar" | "line";
  data: {
    labels?: string[] | undefined;
    datasets?: ChartDataSets[];
  };
  title?: Expression<string>;
  options?: ChartOptions;
}

export type ChartProps = {
  config?: ChartConfigs;
} & EnsembleWidgetProps;

const tabsConfig = {
  bar: <BarChart />,
  doughnut: <DoughnutChart />,
  stackbar: <StackBarChart />,
  line: <LineChart />,
};

export const Chart: React.FC<ChartProps> = (props) => {
  const context = useScreenContext();

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const config = new Function(
    `return ${props.config?.toString() || "{}"}`,
  )() as ChartConfigs;

  const evaluatedDatasets = useMemo(
    () =>
      evaluate(
        context as ScreenContextDefinition,
        JSON.stringify(config?.data?.datasets),
      ),
    [config?.data?.datasets, context],
  );

  if (!config.type) return <b>Chart type missing</b>;
  if (!evaluatedDatasets) return null;

  return cloneElement(tabsConfig[config.type], {
    ...props,
    config: {
      ...config,
      data: {
        ...config.data,
        datasets: evaluatedDatasets,
      },
    },
  });
};

WidgetRegistry.register("Chart", Chart);
