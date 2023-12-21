import { useAtomValue } from "jotai";
import type { CSSProperties } from "react";
import { resolveStyleNames } from "../shared";
import { themeAtom } from "../state";

export const useThemeContext = (
  styleNames?: string | string[],
): CSSProperties | undefined => {
  const themeContext = useAtomValue(themeAtom);

  if (styleNames && themeContext) {
    return resolveStyleNames(styleNames, themeContext);
  }
};
