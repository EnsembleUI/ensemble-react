import { getPrettyDate } from "./utils/getPrettyDate";
import {
  type PrettyDurationOptions,
  getPrettyDuration,
} from "./utils/getPrettyDuration";
import { getPrettyTime } from "./utils/getPrettyTime";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

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
  humanize: (input: string) => string;
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
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  const now = (): EnsembleDateTime => {
    const date = new Date();
    const currentDate = dayjs();
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
      getDaysDifference: (input: string): number =>
        dayjs(input).diff(currentDate, "day"),
      getMonthsDifference: (input: string): number =>
        dayjs(input).diff(currentDate, "month"),
      getYearsDifference: (input: string): number =>
        dayjs(input).diff(currentDate, "year"),
      humanize: (input: string): string =>
        dayjs.duration(dayjs(input).diff(currentDate)).humanize(true),
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
