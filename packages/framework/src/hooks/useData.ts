import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { isString } from "lodash-es";
import { selectAtom } from "jotai/utils";
import { screenAtom } from "../state";
import type { Expression } from "../models";
import { evaluate } from "../evaluate";

type TemplateData = object | unknown[];

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
