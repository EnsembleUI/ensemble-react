import { getPrettyDate } from "./utils/getPrettyDate";
import {
  type PrettyDurationOptions,
  getPrettyDuration,
} from "./utils/getPrettyDuration";
import { getPrettyTime } from "./utils/getPrettyTime";

export interface EnsembleDateTime {
  getDate: () => string;
  getDateTime: () => string;
  prettyDateTime: () => string;
  prettyDate: () => string;
  getYear: () => number;
  getMonth: () => number;
  getDay: () => number;
  getDayOfWeek: () => number;
  getHour: () => number;
  getMinute: () => number;
  getSecond: () => number;
  getMilliseconds: () => number;
}

export interface EnsembleFormatter {
  now: () => EnsembleDateTime;
  prettyDateTime: (input: string) => string;
  prettyDate: (input: string) => string;
  prettyDuration: (
    input: string | number,
    options?: PrettyDurationOptions,
  ) => string;
}

export const useEnsembleFormatter = (): EnsembleFormatter => {
  const now = (): EnsembleDateTime => {
    const date = new Date();
    return {
      getDate: () => date.toISOString().split("T")[0],
      getDateTime: () => date.toISOString(),
      prettyDateTime: () =>
        `${date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} ${date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })}`,
      prettyDate: () =>
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      getYear: () => date.getFullYear(),
      getMonth: () => date.getMonth() + 1,
      getDay: () => date.getDate(),
      getDayOfWeek: () => date.getDay(),
      getHour: () => date.getHours(),
      getMinute: () => date.getMinutes(),
      getSecond: () => date.getSeconds(),
      getMilliseconds: () => date.getMilliseconds(),
    };
  };

  const prettyDate = (input: string): string => {
    const date = new Date(input);
    return getPrettyDate(date);
  };

  const prettyDateTime = (input: string): string => {
    const date = new Date(input);
    return `${getPrettyDate(date)} ${getPrettyTime(date)}`;
  };

  const prettyDuration = (
    input: string | number,
    options?: PrettyDurationOptions,
  ): string => getPrettyDuration(input, options);

  return {
    now,
    prettyDate,
    prettyDateTime,
    prettyDuration,
  };
};
