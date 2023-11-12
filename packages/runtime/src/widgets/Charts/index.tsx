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
import { useWidgetId, type Expression } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetProps } from "../../shared/types";
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
  label?: string;
  data: number[];
  backgroundColor?: string[] | string;
  barPercentage?: number;
  borderRadius?: number;
  borderColor?: string[] | string;
  borderWidth?: number;
}

export type ChartProps = {
  type: "bar" | "doughnut" | "stackbar" | "line";
  labels: string[] | undefined;
  datasets: ChartDataSets[];
  title?: Expression<string>;
  options?: ChartOptions;
  [key: string]: unknown;
} & EnsembleWidgetProps;

const tabsConfig = {
  bar: <BarChart />,
  doughnut: <DoughnutChart />,
  stackbar: <StackBarChart />,
  line: <LineChart />,
};

export const Chart: React.FC<ChartProps> = (props) => {
  const { type } = props;
  const { rootRef } = useWidgetId(props.id);

  if (!type) {
    return <b>Chart type missing</b>;
  }

  return (
    <div ref={rootRef}>{cloneElement(tabsConfig[type], { ...props })}</div>
  );
};

WidgetRegistry.register("Chart", Chart);
