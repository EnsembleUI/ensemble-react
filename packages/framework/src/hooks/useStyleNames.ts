import { useAtomValue } from "jotai";
import type { CSSProperties } from "react";
import { get, intersection, isEmpty, isString, keys, merge } from "lodash-es";
import { type EnsembleThemeModel, type Expression } from "../shared";
import { themeAtom } from "../state";
import { useEvaluate } from "./useEvaluate";

const resolveStyleNames = (
  styleNames: string[],
  theme: EnsembleThemeModel,
): CSSProperties => {
  const appStyleNames = keys(theme.Styles);
  const overlappingNames = intersection(styleNames, appStyleNames);
  if (isEmpty(overlappingNames)) {
    return {};
  }

  const appliedStyles = {};
  overlappingNames.forEach((name) => {
    merge(appliedStyles, get(theme.Styles, name));
  });

  return appliedStyles;
};

export const useStyleNames = (
  namedStyles?: Expression<string | string[]>,
  classStyles?: Expression<string | string[]>,
): CSSProperties | undefined => {
  const themeContext = useAtomValue(themeAtom);

  // evaluate styles
  const nameStylesArray: string[] | undefined = isString(namedStyles)
    ? namedStyles.split(" ")
    : namedStyles;
  const nameStyles = useEvaluate({ nameStylesArray });

  // evaluate classnames
  const classStylesArray: string[] | undefined = isString(classStyles)
    ? classStyles.split(" ")
    : classStyles;
  const styleClasses = useEvaluate({ classStylesArray });

  const styleNames = [
    ...(nameStyles.nameStylesArray?.map((nameStyle) => `${nameStyle}`) || []),
    ...(styleClasses.classStylesArray?.map((className) => `.${className}`) ||
      []),
  ];

  if (styleNames.length && themeContext) {
    return resolveStyleNames(styleNames, themeContext);
  }
};
