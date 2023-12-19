export interface PrettyDurationOptions {
  abbreviated?: boolean;
}

type Unit = "millisecond" | "second" | "minute" | "hour" | "day" | "week";

const UNIT_LABELS = {
  week: { short: "wk", long: "week" },
  day: { short: "d", long: "day" },
  hour: { short: "hr", long: "hour" },
  minute: { short: "min", long: "minute" },
  second: { short: "sec", long: "second" },
  millisecond: { short: "ms", long: "millisecond" },
};

export const getPrettyDuration = (
  input: number | string,
  options: PrettyDurationOptions = {},
): string => {
  const duration = typeof input === "string" ? parseInt(input) : input;
  const units = getTimeUnits(duration);
  const parts: string[] = [];

  (
    ["week", "day", "hour", "minute", "second", "millisecond"] as Unit[]
  ).forEach(
    (unit) =>
      units[unit] > 0 &&
      parts.push(
        `${units[unit]} ${
          options.abbreviated ? UNIT_LABELS[unit].short : UNIT_LABELS[unit].long
        }${units[unit] > 1 ? "s" : ""}`,
      ),
  );

  return parts.join(" ");
};

const getTimeUnits = (duration: number): Record<Unit, number> => {
  const MS_PER_SEC = 1000,
    SEC_PER_MIN = 60,
    MIN_PER_HR = 60,
    HR_PER_DAY = 24,
    DAY_PER_WK = 7;

  const week = Math.floor(
    duration /
      (MS_PER_SEC * SEC_PER_MIN * MIN_PER_HR * HR_PER_DAY * DAY_PER_WK),
  );
  const day = Math.floor(
    (duration %
      (MS_PER_SEC * SEC_PER_MIN * MIN_PER_HR * HR_PER_DAY * DAY_PER_WK)) /
      (MS_PER_SEC * SEC_PER_MIN * MIN_PER_HR * HR_PER_DAY),
  );
  const hour = Math.trunc(
    (duration % (MS_PER_SEC * SEC_PER_MIN * MIN_PER_HR * HR_PER_DAY)) /
      (MS_PER_SEC * SEC_PER_MIN * MIN_PER_HR),
  );
  const minute = Math.trunc(
    (duration % (MS_PER_SEC * SEC_PER_MIN * MIN_PER_HR)) /
      (MS_PER_SEC * SEC_PER_MIN),
  );
  const second = Math.trunc(
    (duration % (MS_PER_SEC * SEC_PER_MIN)) / MS_PER_SEC,
  );
  const millisecond = duration % MS_PER_SEC;

  return {
    week,
    day,
    hour,
    minute,
    second,
    millisecond,
  };
};
