export const getPrettyTime = (date: Date): string =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
