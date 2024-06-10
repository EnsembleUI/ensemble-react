import { filter, isEmpty } from "lodash-es";

export const generateInitials = (name?: string): string =>
  filter<string>(name?.split(/\s+/), (word) => !isEmpty(word))
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 2);
