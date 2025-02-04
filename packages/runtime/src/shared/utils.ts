import { isString } from "lodash-es";
import { IconProps } from "./types";

export const normalizeIconProps = (
  iconProps?: string | IconProps,
  additionalProps?: { [key: string]: unknown },
): IconProps | undefined => {
  const props = isString(iconProps)
    ? { name: iconProps, ...(additionalProps || {}) }
    : iconProps;

  return props;
};
