import { isEqualWith } from "lodash-es";
import { ChartConfigs } from "..";

export const AreConfigObjectsEqual = (
  evaluatedConfig?: ChartConfigs,
  config?: ChartConfigs,
) =>
  isEqualWith(evaluatedConfig, config, (valueA, valueB) => {
    if (typeof valueA === "function" && typeof valueB === "function") {
      return true;
    }
    return undefined;
  });
