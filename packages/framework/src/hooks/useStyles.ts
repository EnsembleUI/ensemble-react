import { useAtomValue } from "jotai";
import { type CSSProperties, useMemo } from "react";
import {
  compact,
  get,
  intersection,
  isEmpty,
  isString,
  keys,
  merge,
  omit,
} from "lodash-es";
import { type EnsembleThemeModel } from "../shared";
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

  const appliedStyles: CSSProperties = {};
  overlappingNames.forEach((name) => {
    merge(appliedStyles, get(theme.Styles, name));
  });

  return appliedStyles;
};

export const useStyles = <T extends { [key: string]: unknown }>(
  values: T,
): CSSProperties | undefined => {
  const namedStyles = get(values, ["styles", "names"]) as unknown;
  const classStyles = get(values, ["styles", "className"]) as unknown;

  const themeContext = useAtomValue(themeAtom);

  const { classStylesArray, nameStylesArray } = useMemo(() => {
    const stringSplitter = (styles: string): string[] =>
      // eslint-disable-next-line prefer-named-capture-group
      styles.split(/([a-zA-Z0-9_-]+)\s+(\${.+?})\s+(\w+)/).filter(Boolean);
    return {
      classStylesArray: isString(classStyles)
        ? stringSplitter(classStyles)
        : [],
      nameStylesArray: isString(namedStyles) ? stringSplitter(namedStyles) : [],
    };
  }, [classStyles, namedStyles]);

  const {
    classStylesArray: classStylesArrayEval,
    nameStylesArray: namedStylesArrayEval,
  } = useEvaluate({
    classStylesArray,
    nameStylesArray,
  });

  const styleNames = compact([
    ...namedStylesArrayEval.map((nameStyle) => `${nameStyle}`),
    ...classStylesArrayEval.map((className) => `.${className}`),
  ]).join(" ");

  const styleProperties = useMemo(() => {
    if (styleNames.length && themeContext) {
      return resolveStyleNames(styleNames.split(" "), themeContext);
    }
  }, [styleNames, themeContext]);

  return useMemo(() => {
    return merge(
      {},
      styleProperties,
      omit(values.styles ?? {}, ["className", "names"]),
    );
  }, [styleProperties, values.styles]);
};
