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
import React, { cloneElement, useEffect, useMemo, useState } from "react";
import {
  evaluate,
  type ScreenContextDefinition,
  type Expression,
  useScreenContext,
  useEnsembleStorage,
  useHtmlPassThrough,
  useWidgetId,
} from "@ensembleui/react-framework";
import { Alert } from "antd";
import { isEqualWith } from "lodash-es";
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

const CONFIG_EVAL_EXPIRY = 5000;

export const Chart: React.FC<ChartProps> = (props) => {
  const context = useScreenContext();
  const storage = useEnsembleStorage();
  const { resolvedWidgetId, resolvedTestId } = useWidgetId(props?.id);
  const { rootRef } = useHtmlPassThrough(
    undefined,
    props.id ? resolvedWidgetId : resolvedTestId,
  );
  const [error, setError] = useState<unknown>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [config, setConfig] = useState<ChartConfigs>();

  useEffect(() => {
    setTimeout(() => setIsExpired(true), CONFIG_EVAL_EXPIRY);
  }, []);

  useMemo(() => {
    try {
      const evaluatedConfig = evaluate<ChartConfigs>(
        context as ScreenContextDefinition,
        // eslint-disable-next-line prefer-named-capture-group
        props.config?.toString()?.replace(/['"]\$\{([^}]*)\}['"]/g, "$1"), // replace "${...}" or '${...}' with ...
        {
          ensemble: {
            storage,
          },
        },
      );

      if (!areConfigObjectsEqual(config, evaluatedConfig)) {
        setConfig(evaluatedConfig);
        setError(null);
      }
    } catch (e) {
      if (!error) {
        setError(e);
      }
    }
  }, [config, context, error, props.config, storage]);

  if (!props.config) {
    return <Alert message="Configuration is missing" type="error" />;
  }

  if (isExpired && error) {
    return (
      <Alert
        message={`Error evaluating configuration: ${String(error)}`}
        type="info"
      />
    );
  }

  if (isExpired && !config?.type) {
    return <Alert message="Chart type is missing" type="error" />;
  }

  if (!config) {
    return null;
  }

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

const areConfigObjectsEqual = (
  evaluatedConfig?: ChartConfigs,
  config?: ChartConfigs,
): boolean =>
  isEqualWith(evaluatedConfig, config, (valueA, valueB) => {
    if (typeof valueA === "function" && typeof valueB === "function") {
      return true;
    }
    return undefined;
  });
