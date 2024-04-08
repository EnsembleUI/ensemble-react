import { useAtomValue } from "jotai";
import { CSSProperties, useMemo } from "react";
import { get, intersection, isEmpty, isString, keys, merge } from "lodash-es";
import { type EnsembleThemeModel, type Expression } from "../shared";
import { themeAtom } from "../state";
import { useEvaluate } from "./useEvaluate";

const resolveStyleNames = (
  styleNames: string,
  theme: EnsembleThemeModel,
): CSSProperties => {
  const appStyleNames = keys(theme.Styles);
  const overlappingNames = intersection(styleNames.split(" "), appStyleNames);
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
    ? // eslint-disable-next-line prefer-named-capture-group
      namedStyles.split(/([a-zA-Z0-9_-]+)\s+(\${.+?})\s+(\w+)/).filter((x) => x)
    : namedStyles;

  // evaluate classnames
  const classStylesArray: string[] | undefined = isString(classStyles)
    ? // eslint-disable-next-line prefer-named-capture-group
      classStyles.split(/([a-zA-Z0-9_-]+)\s+(\${.+?})\s+(\w+)/)
    : classStyles;

  const {
    classStylesArray: classStylesArrayEval,
    nameStylesArray: namedStylesArrayEval,
  } = useEvaluate({
    classStylesArray,
    nameStylesArray,
  });

  const styleNames = [
    ...(namedStylesArrayEval
      ?.filter((className) => className)
      .map((nameStyle) => `${nameStyle}`) || []),
    ...(classStylesArrayEval
      ?.filter((className) => className)
      .map((className) => `.${className}`) || []),
  ].join(" ");

  return useMemo(() => {
    if (styleNames.length && themeContext) {
      return resolveStyleNames(styleNames, themeContext);
    }
  }, [styleNames, themeContext]);
};
