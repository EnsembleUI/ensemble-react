import { get, intersection, isEmpty, isString, keys, merge } from "lodash-es";
import type { CSSProperties } from "react";
import type { EnsembleThemeModel } from "./models";

export const resolveStyleNames = (
  styleNames: string[] | string,
  theme: EnsembleThemeModel,
): CSSProperties => {
  let names;
  if (isString(styleNames)) {
    names = styleNames.split(" ");
  } else {
    names = styleNames;
  }

  const appStyleNames = keys(theme.Styles);
  const overlappingNames = intersection(names, appStyleNames);
  if (isEmpty(overlappingNames)) {
    return {};
  }

  const appliedStyles = {};
  overlappingNames.forEach((name) => {
    merge(appliedStyles, get(theme.Styles, name));
  });
  return appliedStyles;
};
