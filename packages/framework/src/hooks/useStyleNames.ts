import { useAtomValue } from "jotai";
import type { CSSProperties } from "react";
import { type Expression, resolveStyleNames } from "../shared";
import { themeAtom } from "../state";

export const useStyleNames = (
  styleNames?: Expression<string | string[]>,
): CSSProperties | undefined => {
  const themeContext = useAtomValue(themeAtom);

  if (styleNames && themeContext) {
    return resolveStyleNames(styleNames, themeContext);
  }
};
