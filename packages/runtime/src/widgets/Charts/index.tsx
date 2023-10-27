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
import React, { cloneElement } from "react";
import type { Expression } from "@ensembleui/react-framework";
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

interface ChartDataSets {
  data: Expression<number[]>;
  label?: string;
  backgroundColor?: string[] | string;
  barPercentage?: number;
  borderRadius?: number;
  borderColor?: string[] | string;
  borderWidth?: number;
}

export type ChartConfigs = {
  type: "bar" | "doughnut" | "stackbar" | "line";
  labels: string[] | undefined;
  datasets: ChartDataSets[];
  title?: Expression<string>;
  options?: ChartOptions;
};

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
  const config = new Function(
    "return " + props.config?.toString(),
  )() as ChartConfigs;

  if (!config.type) {
    return <b>Chart type missing</b>;
  }

  return cloneElement(tabsConfig[config.type], {
    ...props,
    config: config,
  });
};

WidgetRegistry.register("Chart", Chart);
