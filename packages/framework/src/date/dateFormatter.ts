import { toNumber } from "lodash-es";
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
  prettyTime: () => string;
  getYear: () => number;
  getMonth: () => number;
  getDay: () => number;
  getDayOfWeek: () => number;
  getHour: () => number;
  getMinute: () => number;
  getSecond: () => number;
  getMilliseconds: () => number;
  getDaysDifference: (input: string) => number;
  getMonthsDifference: (input: string) => number;
  getYearsDifference: (input: string) => number;
}

export interface EnsembleFormatter {
  now: () => EnsembleDateTime;
  prettyDateTime: (input: string) => string;
  prettyDate: (input: string) => string;
  prettyTime: (input: string) => string;
  prettyDuration: (
    input: string | number,
    options?: PrettyDurationOptions,
  ) => string;
}

export const DateFormatter = (): EnsembleFormatter => {
  const now = (): EnsembleDateTime => {
    const date = new Date();
    return {
      getDate: () => date.toISOString().split("T")[0],
      getDateTime: () => date.toISOString(),
      prettyDateTime: () => `${getPrettyDate(date)} ${getPrettyTime(date)}`,
      prettyDate: () => getPrettyDate(date),
      prettyTime: () => getPrettyTime(date),
      getYear: () => date.getFullYear(),
      getMonth: () => date.getMonth() + 1,
      getDay: () => date.getDate(),
      getDayOfWeek: () => date.getDay(),
      getHour: () => date.getHours(),
      getMinute: () => date.getMinutes(),
      getSecond: () => date.getSeconds(),
      getMilliseconds: () => date.getMilliseconds(),
      getDaysDifference: (input: string): number => {
        const inputDate = new Date(input);
        const timeDiff = inputDate.getTime() - date.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 0;
      },
      getMonthsDifference: (input: string): number => {
        const inputDate = new Date(input);
        const timeDiff = inputDate.getTime() - date.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24 * 30)) + 0;
      },
      getYearsDifference: (input: string): number => {
        const inputDate = new Date(input);
        return inputDate.getFullYear() - date.getFullYear();
      },
    };
  };

  const prettyDate = (input: string): string => {
    const date = new Date(input);
    return getPrettyDate(date);
  };

  const prettyTime = (input: string): string => {
    const date = new Date(input);
    return getPrettyTime(date);
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
    prettyTime,
    prettyDateTime,
    prettyDuration,
  };
};
