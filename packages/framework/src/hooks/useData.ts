import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { isString } from "lodash-es";
import { selectAtom } from "jotai/utils";
import { screenAtom } from "../state";
import { evaluate } from "../evaluate";
import type { Expression, TemplateData } from "../shared/common";

export const useTemplateData = (
  expression: Expression<TemplateData>,
): TemplateData | undefined => {
  const isExpression = isString(expression);
  const dataAtom = useMemo(
    () =>
      selectAtom(screenAtom, (screenContext) =>
        evaluate(screenContext, String(expression)),
      ),
    [expression],
  );
  const dataValue = useAtomValue(dataAtom);

  return isExpression ? (dataValue as TemplateData) : expression;
};
