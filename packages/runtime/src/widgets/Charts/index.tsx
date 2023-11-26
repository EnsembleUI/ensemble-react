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
import React, { cloneElement, useEffect, useState } from "react";
import {
  evaluate,
  type ScreenContextDefinition,
  type Expression,
  useScreenContext,
  useWidgetId,
} from "@ensembleui/react-framework";
import { Alert } from "antd";
import { noop } from "lodash-es";
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
  const { rootRef } = useWidgetId(props.id);
  const [evaluationsDone, setEvaluationsDone] = useState(false);
  const [config, setConfig] = useState<ChartConfigs | undefined>(undefined);

  useEffect(() => {
    const evaluateConfig = (): void => {
      try {
        const evaluatedVal = evaluate(
          context as ScreenContextDefinition,
          props?.config?.toString()?.replace(/['"]\$\{([^}]*)\}['"]/g, "$1"), // replace "${...}" or '${...}' with ...
        ) as ChartConfigs;
        setConfig(evaluatedVal);
        setEvaluationsDone(true);
      } catch (e) {
        noop();
      }
    };

    if (!evaluationsDone) evaluateConfig();
  }, [props.config, context, evaluationsDone]);

  if (!evaluationsDone) return null; // evaluating ...

  if (!props?.config || !config)
    return (
      <Alert
        message={`config is ${!props?.config ? "missing" : "bad"}`}
        type="error"
      />
    );

  if (!config.type) return <b>Chart type missing</b>;

  return (
    <div
      ref={rootRef}
      style={{
        height: props.styles?.height ?? "100%",
        width: props.styles?.width ?? "100%",
      }}
    >
      {cloneElement(tabsConfig[config.type], { ...props, config })}
    </div>
  );
};

WidgetRegistry.register("Chart", Chart);
