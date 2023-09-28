import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import React from "react";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetProps } from "../../util/types";
import { BarChart } from "./BarChart";
import { DoughnutChart } from "./DoughnutChart";
import { StackBarChart } from "./StackBarChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface ChartDataSets {
  label?: string;
  data: number[];
  backgroundColor?: string[] | string;
  barPercentage?: number;
  borderRadius?: number;
  borderColor?: string[] | string;
  borderWidth?: number;
}

export type ChartProps = {
  type: "bar" | "doughnut" | "stackbar";
  labels: string[] | undefined;
  datasets: ChartDataSets[];
  [key: string]: unknown;
} & EnsembleWidgetProps;

const tabsConfig = {
  bar: <BarChart />,
  doughnut: <DoughnutChart />,
  stackbar: <StackBarChart />
};

export const Chart: React.FC<ChartProps> = (props) => {
  const { labels, datasets, type } = props;

  if (!type) {
    return <b>Chart type missing</b>;
  }

  return React.cloneElement(tabsConfig[type], { labels, datasets });
};

WidgetRegistry.register("Chart", Chart);
