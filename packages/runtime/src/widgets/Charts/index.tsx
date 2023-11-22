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
import { Alert } from "antd";

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

  const config = useMemo(
    () =>
      evaluate(
        context as ScreenContextDefinition,
        props?.config?.toString()?.replace(/['"]\$\{([^}]*)\}['"]/g, "$1"), // replace "${...}" or '${...}' with ...
      ) as ChartConfigs,
    [props.config, context],
  );

  if (!config || !props?.config)
    return (
      <Alert
        message={`config is ${!props?.config ? "missing" : "bad"}`}
        type="error"
      />
    );

  if (!config.type) return <b>Chart type missing</b>;

  return cloneElement(tabsConfig[config.type], {
    ...props,
    config,
  });
};

WidgetRegistry.register("Chart", Chart);
