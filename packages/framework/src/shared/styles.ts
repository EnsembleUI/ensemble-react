import { get, intersection, isEmpty, isString, keys, merge } from "lodash-es";
import type { CSSProperties } from "react";
import { useEvaluate } from "../hooks";
import { isExpression } from "./common";
import type { EnsembleThemeModel } from "./models";

export const resolveStyleNames = (
  styleNames: string[] | string,
  theme: EnsembleThemeModel,
): CSSProperties => {
  let names: string[] = isString(styleNames)
    ? styleNames.split(" ")
    : styleNames;

  names = names.map((styleName) => {
    const isClass = styleName.startsWith(".");
    const styleKey = isClass ? styleName.substring(1) : styleName;
    const styleVal = isExpression(styleKey)
      ? useEvaluate({ styleKey }).styleKey
      : styleKey;

    return isClass ? `.${styleVal}` : styleVal;
  });

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
