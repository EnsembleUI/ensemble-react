import { useAtomValue } from "jotai";
import { type CSSProperties, useMemo } from "react";
import {
  compact,
  get,
  intersection,
  isEmpty,
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
  const namedStyles = get(values, ["styles", "names"]) as string;
  const classStyles = get(values, ["styles", "className"]) as string;
  const widgetName = get(values, ["widgetName"]) as string;

  const themeContext = useAtomValue(themeAtom);

  const { classStyles: classStylesEval, namedStyles: namedStylesEval } =
    useEvaluate({
      classStyles: `\${\`${classStyles || ""}\`}`,
      namedStyles: `\${\`${namedStyles || ""}\`}`,
    });

  const styleNames = compact(
    classStylesEval
      ?.trim()
      .split(" ")
      .filter((className) => !isEmpty(className))
      .map((className) => `.${className}`),
  )
    .join(" ")
    .concat(` ${namedStylesEval?.trim()}`);

  const styleProperties = useMemo(() => {
    return styleNames && themeContext
      ? resolveStyleNames(
          [...styleNames.split(" "), widgetName || ""].filter(
            (styleName) => !isEmpty(styleName),
          ),
          themeContext,
        )
      : undefined;
  }, [widgetName, styleNames, themeContext]);

  return useMemo(() => {
    return merge(
      {},
      styleProperties,
      omit(values.styles ?? {}, ["className", "names"]),
    );
  }, [styleProperties, values.styles]);
};
