import { useAtomValue } from "jotai";
import type { CSSProperties } from "react";
import { type Expression, resolveStyleNames } from "../shared";
import { themeAtom } from "../state";
import { isString } from "lodash-es";

export const useStyleNames = (
  namedStyles?: Expression<string | string[]>,
  classStyles?: Expression<string | string[]>,
): CSSProperties | undefined => {
  const themeContext = useAtomValue(themeAtom);

  let dotClassStyles = "";
  if (isString(classStyles) && classStyles.length > 0) {
    dotClassStyles = classStyles
      .trim()
      .split(" ")
      .map((className) => `.${className}`)
      .join(" ");
  }
  const styleNames = `${isString(namedStyles) ? namedStyles : ""} ${dotClassStyles}`;

  if (styleNames && themeContext) {
    return resolveStyleNames(styleNames, themeContext);
  }
};
