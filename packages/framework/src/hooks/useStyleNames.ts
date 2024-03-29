import { useAtomValue } from "jotai";
import type { CSSProperties } from "react";
import { get, intersection, isEmpty, isString, keys, merge } from "lodash-es";
import {
  type EnsembleThemeModel,
  isExpression,
  type Expression,
} from "../shared";
import { themeAtom, defaultScreenContext } from "../state";
import { evaluate } from "../evaluate";
import { type EnsembleStorage, useEnsembleStorage } from "./useEnsembleStorage";
import { type CustomScope, useCustomScope } from "./useCustomScope";

const resolveStyleNames = (
  styleNames: string[] | string,
  theme: EnsembleThemeModel,
  storage: EnsembleStorage,
  customScope?: CustomScope,
): CSSProperties => {
  let names: string[] = isString(styleNames)
    ? styleNames.split(" ")
    : styleNames;

  names = names.map((styleName) => {
    const isClass = styleName.startsWith(".");
    const styleKey = isClass ? styleName.substring(1) : styleName;
    const styleVal = isExpression(styleKey)
      ? evaluate<string>(defaultScreenContext, styleKey, {
          ensemble: { storage },
          ...customScope,
        })
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

export const useStyleNames = (
  namedStyles?: Expression<string | string[]>,
  classStyles?: Expression<string | string[]>,
): CSSProperties | undefined => {
  const themeContext = useAtomValue(themeAtom);
  const storage = useEnsembleStorage();
  const customScope = useCustomScope();

  let dotClassStyles = "";
  if (isString(classStyles) && classStyles.length > 0) {
    dotClassStyles = classStyles
      .trim()
      .split(" ")
      .map((className) => `.${className}`)
      .join(" ");
  }
  const styleNames = `${
    isString(namedStyles) ? namedStyles : ""
  } ${dotClassStyles}`.trim();

  if (styleNames && themeContext) {
    return resolveStyleNames(styleNames, themeContext, storage, customScope);
  }
};
