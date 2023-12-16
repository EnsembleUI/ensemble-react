// returns true if date is in mm/dd/yyyy format
export const isDateValid = (date?: string): boolean =>
  Boolean(date) &&
  /^(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(date || "");
