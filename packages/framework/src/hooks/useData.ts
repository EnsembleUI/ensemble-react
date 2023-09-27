import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { get, isString } from "lodash-es";
import { selectAtom } from "jotai/utils";
import { screenAtom } from "../state";
import type { Expression } from "../models";

type TemplateData = object | unknown[];

export const useTemplateData = (
  expression: Expression<TemplateData>,
): TemplateData | undefined => {
  const isExpression = isString(expression);
  const dataAtom = useMemo(
    () =>
      selectAtom(screenAtom, (screenContext) =>
        get(screenContext, String(expression)),
      ),
    [expression],
  );
  const dataValue = useAtomValue(dataAtom);

  return isExpression ? (dataValue as TemplateData) : expression;
};
